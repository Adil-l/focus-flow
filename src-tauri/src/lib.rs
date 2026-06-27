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
    let mut pending = String::new(); // lines seen since an unmatched BEGIN
    let mut skip = false;
    for line in content.lines() {
        let t = line.trim();
        if t == BEGIN {
            // A duplicate/nested BEGIN before an END: keep the prior buffered
            // lines as real data rather than dropping them.
            if skip {
                out.push_str(&pending);
            }
            pending.clear();
            skip = true;
            continue;
        }
        if t == END {
            // Properly terminated block — discard the buffered block lines.
            pending.clear();
            skip = false;
            continue;
        }
        if skip {
            pending.push_str(line);
            pending.push('\n');
        } else {
            out.push_str(line);
            out.push('\n');
        }
    }
    // Dangling BEGIN with no END (e.g. an interrupted write left the file
    // truncated mid-block): restore the buffered lines instead of silently
    // deleting everything after BEGIN — never lose the user's real host entries.
    if skip {
        out.push_str(&pending);
    }
    out
}

// Strict hostname validation. The Rust side is the trust boundary for the
// privileged /etc/hosts write, so we never assume the JS already sanitized:
// reject anything with embedded whitespace/newlines, IP literals, or junk that
// could inject extra lines or block the wrong host.
fn is_valid_host(h: &str) -> bool {
    if h.is_empty() || h.len() > 253 || !h.contains('.') {
        return false;
    }
    let labels: Vec<&str> = h.split('.').collect();
    for label in &labels {
        if label.is_empty() || label.len() > 63 {
            return false;
        }
        if !label
            .bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-')
        {
            return false;
        }
        if label.starts_with('-') || label.ends_with('-') {
            return false;
        }
    }
    // The TLD must contain a letter — rejects IP literals (0.0.0.0, 127.0.0.1).
    labels
        .last()
        .is_some_and(|tld| tld.bytes().any(|b| b.is_ascii_lowercase()))
}

// Validate a temp path is shell/AppleScript-safe before it reaches the
// privileged osascript step (defense-in-depth against a hostile TMPDIR).
fn safe_path(p: &std::path::Path) -> Result<String, String> {
    let s = p.to_str().ok_or_else(|| "non-utf8 temp path".to_string())?;
    if !s.is_empty()
        && s.chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '/' | '.' | '_' | '-'))
    {
        Ok(s.to_string())
    } else {
        Err("unsafe temp path".to_string())
    }
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
        if !is_valid_host(&n) {
            continue; // skip anything that isn't a clean hostname token
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
    fs::write(&hosts_tmp, new_content).map_err(|e| e.to_string())?;

    // Validate the temp path is safe before it reaches the privileged step.
    let src = safe_path(&hosts_tmp)?;

    // The privileged step is tiny and fixed: copy the prepared file into /etc as
    // a sibling temp, then ATOMICALLY rename it over /etc/hosts. rename(2) on the
    // same filesystem is atomic, so a crash/kill/power-loss mid-write can never
    // leave /etc/hosts truncated (which is how a dangling BEGIN marker — and the
    // old non-atomic `cp` — could destroy the user's real entries). `src` is
    // charset-validated above, so single-quoting it is injection-safe.
    let cmd = format!(
        "cp '{src}' '/etc/hosts.focusflow.tmp' && chmod 644 '/etc/hosts.focusflow.tmp' && mv -f '/etc/hosts.focusflow.tmp' /etc/hosts; dscacheutil -flushcache 2>/dev/null || true; killall -HUP mDNSResponder 2>/dev/null || true; true"
    );
    let applescript = format!(
        "do shell script \"{cmd}\" with administrator privileges"
    );
    let output = Command::new("/usr/bin/osascript")
        .arg("-e")
        .arg(&applescript)
        .output()
        .map_err(|e| e.to_string())?;

    let _ = fs::remove_file(&hosts_tmp);

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

// --- live blocklist feeds ("deep mode") ----------------------------------------
// Download maintained public blocklists (StevenBlack, Hagezi, blocklistproject,
// URLhaus, Peter Lowe) and merge them with the curated list into the single
// Focus Flow /etc/hosts block. Fetching shells out to the system curl — no extra
// crate, uses the platform TLS — and only accepts https URLs whose host is on a
// fixed allow-list (the URL is passed as a separate arg, never through a shell).
// We re-apply (and so trigger the admin prompt) ONLY when the resulting hosts
// content actually changes, so the daily auto-refresh is silent unless a feed
// updated. If every feed fails (e.g. offline) we leave the current block intact.

const FEED_HOST_ALLOW: &[&str] = &[
    "raw.githubusercontent.com",
    "urlhaus.abuse.ch",
    "pgl.yoyo.org",
];
const MAX_FEED_BYTES: u64 = 80 * 1024 * 1024; // safety cap per feed
// If feeds were requested but yield fewer than this many hosts, treat it as a bad
// fetch (offline, captive portal, an HTML error page parsed to nothing) and keep
// the existing block rather than shrinking it. The smallest real single-category
// feed (piracy) is ~1.2k, so this never trips on legitimate data.
const MIN_FEED_HOSTS: usize = 100;

#[derive(serde::Serialize)]
struct FeedResult {
    applied: bool,      // did we rewrite /etc/hosts (i.e. did the user see a prompt)?
    total: usize,       // unique hosts in the resulting block
    fetched: usize,     // feeds successfully downloaded
    errors: Vec<String>,
}

fn feed_url_ok(url: &str) -> bool {
    match url.strip_prefix("https://") {
        Some(rest) => {
            let host = rest.split('/').next().unwrap_or("");
            FEED_HOST_ALLOW.iter().any(|h| host == *h)
        }
        None => false,
    }
}

fn fetch_feed_to(url: &str, dest: &std::path::Path) -> Result<(), String> {
    if !feed_url_ok(url) {
        return Err("feed url not allowed".to_string());
    }
    let out = Command::new("/usr/bin/curl")
        .args([
            "-sL", "--fail", "--proto", "=https", "--max-time", "120",
            "--max-filesize", "83886080",
            "-A", "FocusFlow/1.0 (blocklist updater)",
            "-o",
        ])
        .arg(dest)
        .arg(url) // separate arg, no shell -> no injection
        .output()
        .map_err(|e| e.to_string())?;
    if out.status.success() {
        Ok(())
    } else {
        Err(format!("curl exit {:?}", out.status.code()))
    }
}

// Parse a hosts-format (or plain domain) list into the set. Tolerates
// "0.0.0.0 host", "127.0.0.1\thost", plain "host", trailing "# comments".
fn parse_hosts_file(
    path: &std::path::Path,
    set: &mut std::collections::BTreeSet<String>,
) -> Result<usize, String> {
    use std::io::{BufRead, Read};
    let f = fs::File::open(path).map_err(|e| e.to_string())?;
    let reader = std::io::BufReader::new(f.take(MAX_FEED_BYTES));
    let mut n = 0usize;
    for line in reader.lines() {
        let line = match line {
            Ok(l) => l,
            Err(_) => break,
        };
        let t = line.trim();
        if t.is_empty() || t.starts_with('#') || t.starts_with('!') {
            continue;
        }
        let mut parts = t.split_whitespace();
        let first = parts.next().unwrap_or("");
        let host = match first {
            "0.0.0.0" | "127.0.0.1" | "::1" | "::" | "255.255.255.255" => parts.next().unwrap_or(""),
            _ => first,
        };
        let host = host.split('#').next().unwrap_or("").trim();
        let h = norm(host);
        // Skip loopback/special names some hosts files declare in their header
        // (e.g. "127.0.0.1 localhost.localdomain") — mapping those to 0.0.0.0
        // would break loopback expectations.
        if h == "localhost.localdomain" || h.ends_with(".localdomain") || h.ends_with(".localhost") {
            continue;
        }
        if is_valid_host(&h) && set.insert(h) {
            n += 1;
        }
    }
    Ok(n)
}

fn block_from_set(set: &std::collections::BTreeSet<String>) -> String {
    let mut b = String::with_capacity(set.len() * 20 + 128);
    b.push_str(BEGIN);
    b.push('\n');
    b.push_str("# Managed by Focus Flow — do not edit between these markers.\n");
    for h in set {
        b.push_str("0.0.0.0 ");
        b.push_str(h);
        b.push('\n');
    }
    b.push_str(END);
    b.push('\n');
    b
}

fn apply_feeds_blocking(curated: Vec<String>, feeds: Vec<String>) -> Result<FeedResult, String> {
    let mut set: std::collections::BTreeSet<String> = std::collections::BTreeSet::new();
    // Curated entries are base domains -> also block their www. variant.
    for d in &curated {
        let n = norm(d);
        if is_valid_host(&n) {
            set.insert(format!("www.{n}"));
            set.insert(n);
        }
    }
    let tmp = std::env::temp_dir();
    let mut errors = Vec::new();
    let mut fetched = 0usize;
    let mut feed_added = 0usize;
    for (i, url) in feeds.iter().enumerate() {
        let dest = tmp.join(format!("focusflow-feed-{i}.txt"));
        match fetch_feed_to(url, &dest).and_then(|_| parse_hosts_file(&dest, &mut set)) {
            Ok(n) => {
                fetched += 1;
                feed_added += n;
            }
            Err(e) => errors.push(format!("{url}: {e}")),
        }
        let _ = fs::remove_file(&dest);
    }
    // Feeds were requested but produced too little usable data (offline, all
    // failed, or a captive portal / HTML error page) -> keep the existing block
    // rather than silently shrinking protection.
    if !feeds.is_empty() && feed_added < MIN_FEED_HOSTS {
        return Err(format!(
            "feeds returned too little ({feed_added} hosts) — keeping current block. {}",
            errors.join("; ")
        ));
    }
    let block = block_from_set(&set);
    let current = fs::read_to_string(HOSTS).map_err(|e| e.to_string())?;
    let mut base = strip_block(&current);
    while base.ends_with("\n\n") {
        base.pop();
    }
    if !base.ends_with('\n') {
        base.push('\n');
    }
    let new_content = format!("{base}{block}");
    if new_content == current {
        return Ok(FeedResult { applied: false, total: set.len(), fetched, errors });
    }
    apply_hosts(&new_content)?;
    Ok(FeedResult { applied: true, total: set.len(), fetched, errors })
}

/// Apply the curated list plus the given maintained feeds, merged into one block.
#[tauri::command]
async fn block_apply_feeds(curated: Vec<String>, feeds: Vec<String>) -> Result<FeedResult, String> {
    tauri::async_runtime::spawn_blocking(move || apply_feeds_blocking(curated, feeds))
        .await
        .map_err(|e| e.to_string())?
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
        .invoke_handler(tauri::generate_handler![block_apply, block_apply_feeds, block_clear, block_status, set_kiosk, open_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
