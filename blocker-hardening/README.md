# Focus Flow Blocker — making it hard to remove

This tooling lives **outside** `extension/` on purpose: Chrome bundles the whole
loaded folder, and a signing key (`.pem`) or scripts inside it break the unpacked
load ("This extension includes the key file…"). Keep runtime in `extension/`,
keep hardening here.

Two layers make turning the blocker off — or getting rid of it — deliberately
exhausting.

| Layer | Stops impulse "just disable it" | Stops removing the extension | Self-heals tampering | Needs admin |
|-------|:--:|:--:|:--:|:--:|
| **1. In-app friction** (in the extension) | ✅ | ❌ | — | no |
| **2. Browser lock** (managed policy + guardian) | ✅ | ✅ | ✅ | yes (once) |

> Honest limit: a *normal* Chrome extension is **always** removable from
> `chrome://extensions` — Chrome forbids an extension protecting itself, by
> design. Layer 1 only governs the popup toggles; it can never disable the
> Remove button. The **only** thing that makes removal hard in the browser is
> Layer 2, which is OS-level **administrator** policy, not extension code.

---

## Layer 1 — in-app friction (active, no admin)

In the extension popup → **🔒 Protect this blocker**: set a commitment phrase, a
password and a cooldown (5–60 min), then **Arm protection**.

Once armed you can't turn the master off, un-tick a category, enable "only during
focus", add an allow-list site, or remove a personal block — not from the popup
*and not from the Focus Flow app* (the service worker reverts any weakening
write). To weaken anything: retype phrase + password → **wait out the cooldown** →
a ~2-minute editable window opens.

This does **not** stop removing the whole extension. That's Layer 2.

---

## Layer 2 — browser lock (one admin command)

Force-installs the extension via Chrome enterprise policy. It then shows
*"Installed by enterprise policy"* with **no Remove/Disable button**, and a
self-healing watchdog restores the lock if the policy or crx is deleted.

Chrome **rejects `file://` update URLs** for force-install, so this self-hosts the
crx over a localhost server (`127.0.0.1:8788`). Both the server and the watchdog
run as root LaunchDaemons.

### Easiest — double-click, no Terminal (recommended)

Build the apps once:

```bash
./app/build.sh        # compiles into ~/Applications, payload bundled
```

This produces two **self-contained** apps in `~/Applications`:

- **Activate Focus Flow Protection.app** — double-click → confirm → macOS shows
  its native "enter your admin password" dialog **once** → it installs the lock
  for you. No Terminal, no typing `sudo`.
- **Deactivate Focus Flow Protection.app** — the escape hatch, same flow.

They wrap the install in AppleScript's `do shell script … with administrator
privileges` — the standard macOS way an app *asks* for authorization and the OS
validates it. Each app carries its whole payload (crx, watchdog, plists,
installer) in `Contents/Resources`, so it never reads the repo.

> **Why ~/Applications, not the repo?** `~/Documents` is TCC-protected: an
> unsigned app can't read scripts there even as root ("Operation not permitted").
> `~/Applications` isn't protected, and the self-contained bundle removes the
> dependency entirely. Don't move these apps into Documents/Desktop/Downloads.
> Built locally, so no Gatekeeper quarantine; if macOS ever questions an unsigned
> app, right-click → **Open**.

### Or via Terminal

```bash
cd blocker-hardening
./pack.sh                                   # sign a .crx + update.xml (needs Google Chrome)
sudo ./guardian/install-guardian-macos.sh   # update server + watchdog + policy
# then FULLY quit Chrome (Cmd-Q) and reopen
```

Verify:

- `chrome://policy` → `ExtensionSettings` lists
  `agghgncnlmekjhehiconlkokhdcclchn` `force_installed`.
- `chrome://extensions` → **Focus Flow Blocker** reads *"Installed by enterprise
  policy"*, toggle locked on, **Remove gone**.
- Try `sudo rm "/Library/Managed Preferences/com.google.Chrome.plist"` → within
  ~30s the watchdog rewrites it (see `/var/log/focusflow-guardian.log`).

What it installs (all root-owned, so a non-admin can't touch them):

| Path | Why |
|------|-----|
| `/Library/Application Support/FocusFlow/` | crx + update.xml + watchdog.sh (served on localhost) |
| `/usr/local/share/focusflow/` | root-only backup of the crx/update.xml |
| `/Library/Managed Preferences/com.google.Chrome.plist` | the force-install policy |
| `/Library/LaunchDaemons/app.focusflow.updateserver.plist` | localhost crx server (port 8788) |
| `/Library/LaunchDaemons/app.focusflow.guardian.plist` | the self-healing watchdog |

To remove it (admin-only escape hatch — stops the watchdog first):

```bash
sudo blocker-hardening/guardian/uninstall-guardian-macos.sh
# then quit & reopen Chrome
```

---

## The signing key

`ff_signing_key.pem` (here, **git-ignored**) is your build's identity. Its public
half is pinned in `extension/manifest.json` as `key`, fixing the ID to
`agghgncnlmekjhehiconlkokhdcclchn`. Keep it private:

- **Lose it** → re-packing yields a different ID; the policy + installed copy
  break (regenerate a key, update `manifest.json` `key`, reinstall).
- **Never commit it.** `.gitignore` here excludes it and `dist/`.

---

## Troubleshooting

- **Remove button still there after install.** Did you FULLY quit Chrome
  (Cmd-Q, not just close the window) and reopen? Check `chrome://policy`. If
  `ExtensionSettings` is missing, `sudo killall cfprefsd` and relaunch Chrome.
- **`chrome://policy` shows it but the extension didn't install.** The localhost
  server may be down — `curl http://127.0.0.1:8788/update.xml` should return XML;
  check `/var/log/focusflow-updateserver.log`. Confirm `/usr/bin/python3` exists
  and port 8788 is free (change it in both the `.plist` and `pack.sh` if not).
- **`pack.sh` makes no crx.** Ensure `ff_signing_key.pem` exists (or pass
  `FF_SIGNING_KEY=/path/key.pem`) and Chrome is installed. The key must be a
  PKCS#8 PEM (`-----BEGIN PRIVATE KEY-----`).
- **Wrong Chrome path.** `CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.

## Windows / Linux

Same idea, different policy store: `ExtensionSettings` under
`HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionSettings` (Windows) or
`/etc/opt/chrome/policies/managed/*.json` (Linux). Not scripted here yet.
