use std::fs;
use std::process::Command;

// --- system-wide website blocking via /etc/hosts -------------------------------
// All browsers and apps honour /etc/hosts, so this blocks everywhere at once.
// The privileged write is performed by osascript's "with administrator
// privileges", which shows the native macOS auth dialog — the app never sees the
// password, and every change is reversible (block_clear).

const BEGIN: &str = "# >>> Focus Flow blocklist >>>";
const END: &str = "# <<< Focus Flow blocklist <<<";
const HOSTS: &str = "/etc/hosts";

fn strip_block(content: &str) -> String {
    let mut out = String::new();
    let mut skip = false;
    for line in content.lines() {
        let t = line.trim();
        if t == BEGIN {
            skip = true;
            continue;
        }
        if t == END {
            skip = false;
            continue;
        }
        if !skip {
            out.push_str(line);
            out.push('\n');
        }
    }
    out
}

fn norm(d: &str) -> String {
    d.trim()
        .to_lowercase()
        .trim_start_matches("https://")
        .trim_start_matches("http://")
        .split('/')
        .next()
        .unwrap_or("")
        .trim()
        .trim_start_matches("www.")
        .to_string()
}

fn build_block(domains: &[String]) -> String {
    let mut b = String::new();
    b.push_str(BEGIN);
    b.push('\n');
    b.push_str("# Managed by Focus Flow — do not edit between these markers.\n");
    let mut seen = std::collections::BTreeSet::new();
    for d in domains {
        let n = norm(d);
        if n.is_empty() || !n.contains('.') {
            continue;
        }
        if !seen.insert(n.clone()) {
            continue;
        }
        b.push_str(&format!("0.0.0.0 {n}\n0.0.0.0 www.{n}\n"));
    }
    b.push_str(END);
    b.push('\n');
    b
}

fn apply_hosts(new_content: &str) -> Result<(), String> {
    let dir = std::env::temp_dir();
    let hosts_tmp = dir.join("focusflow-newhosts");
    let script_tmp = dir.join("focusflow-apply.sh");
    fs::write(&hosts_tmp, new_content).map_err(|e| e.to_string())?;

    // The privileged step is tiny and fixed: copy the prepared file into place
    // and flush the DNS cache. All the content logic ran unprivileged above.
    let script = format!(
        "#!/bin/bash\nset -e\ncp \"{}\" \"{}\"\nchmod 644 \"{}\"\ndscacheutil -flushcache 2>/dev/null || true\nkillall -HUP mDNSResponder 2>/dev/null || true\nexit 0\n",
        hosts_tmp.display(),
        HOSTS,
        HOSTS
    );
    fs::write(&script_tmp, &script).map_err(|e| e.to_string())?;

    let applescript = format!(
        "do shell script \"/bin/bash {}\" with administrator privileges",
        script_tmp.display()
    );
    let output = Command::new("/usr/bin/osascript")
        .arg("-e")
        .arg(&applescript)
        .output()
        .map_err(|e| e.to_string())?;

    let _ = fs::remove_file(&hosts_tmp);
    let _ = fs::remove_file(&script_tmp);

    if output.status.success() {
        return Ok(());
    }
    let err = String::from_utf8_lossy(&output.stderr);
    if err.contains("-128") || err.contains("User canceled") {
        Err("cancelled".to_string())
    } else {
        Err(format!("hosts update failed: {}", err.trim()))
    }
}

/// Apply (or refresh) the Focus Flow blocklist. Returns how many domains were requested.
#[tauri::command]
fn block_apply(domains: Vec<String>) -> Result<usize, String> {
    let current = fs::read_to_string(HOSTS).map_err(|e| e.to_string())?;
    let mut base = strip_block(&current);
    while base.ends_with("\n\n") {
        base.pop();
    }
    if !base.ends_with('\n') {
        base.push('\n');
    }
    let block = build_block(&domains);
    apply_hosts(&format!("{base}{block}"))?;
    Ok(domains.len())
}

/// Remove the Focus Flow blocklist entirely, leaving the rest of /etc/hosts intact.
#[tauri::command]
fn block_clear() -> Result<(), String> {
    let current = fs::read_to_string(HOSTS).map_err(|e| e.to_string())?;
    let base = strip_block(&current);
    apply_hosts(&base)
}

/// The domains currently blocked by Focus Flow (the base host, without the www. duplicate).
#[tauri::command]
fn block_status() -> Result<Vec<String>, String> {
    let current = fs::read_to_string(HOSTS).map_err(|e| e.to_string())?;
    let mut out = Vec::new();
    let mut inblock = false;
    for line in current.lines() {
        let t = line.trim();
        if t == BEGIN {
            inblock = true;
            continue;
        }
        if t == END {
            break;
        }
        if inblock {
            if let Some(rest) = t.strip_prefix("0.0.0.0 ") {
                let host = rest.trim().to_string();
                if !host.starts_with("www.") && !host.is_empty() {
                    out.push(host);
                }
            }
        }
    }
    Ok(out)
}

// --- break "kiosk": lock the whole Mac during a mandatory break -----------------
// Uses NSApplication presentation options (the same API exam-lockdown apps use).
// Hides the Dock + menu bar and disables Cmd-Tab, Cmd-Q and force-quit, so no
// other app can be reached until the break ends. Must run on the main thread.
// If the app dies, macOS restores normal presentation automatically (safety net).

#[cfg(target_os = "macos")]
#[tauri::command]
fn set_kiosk(app: tauri::AppHandle, on: bool) -> Result<(), String> {
    use cocoa::appkit::{NSApp, NSApplicationPresentationOptions as O};
    use cocoa::base::id;
    use cocoa::foundation::NSUInteger;
    use objc::{msg_send, sel, sel_impl};

    app.run_on_main_thread(move || {
        let opts: NSUInteger = if on {
            (O::NSApplicationPresentationHideDock
                | O::NSApplicationPresentationHideMenuBar
                | O::NSApplicationPresentationDisableAppleMenu
                | O::NSApplicationPresentationDisableProcessSwitching
                | O::NSApplicationPresentationDisableForceQuit
                | O::NSApplicationPresentationDisableSessionTermination
                | O::NSApplicationPresentationDisableHideApplication)
                .bits()
        } else {
            0
        };
        unsafe {
            let ns_app: id = NSApp();
            let _: () = msg_send![ns_app, setPresentationOptions: opts];
        }
    })
    .map_err(|e| e.to_string())
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn set_kiosk(_on: bool) -> Result<(), String> {
    Ok(())
}

// Open a URL in the user's default browser / mail client (not the app webview).
#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    let ok = url.starts_with("http://")
        || url.starts_with("https://")
        || url.starts_with("mailto:")
        || url.starts_with("tel:")
        || url.starts_with("sms:");
    if !ok {
        return Err("unsupported url".into());
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("/usr/bin/open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![block_apply, block_clear, block_status, set_kiosk, open_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
