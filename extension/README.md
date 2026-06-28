# Kipto Blocker (browser extension)

Companion extension that blocks distracting / gambling / adult sites **in the
browser**, driven by your Kipto settings. This is one half of the "merge":

- **Kipto (web app)** — where you choose categories, your personal block /
  allow lists, and whether to block only during focus sessions.
- **This extension** — reads that config and actually blocks the sites. It also
  reacts to your live focus sessions (block only while focusing).
- **Desktop app (Tauri + Rust)** — *next track*, for true system-wide blocking
  (every app, not just the browser) via a local DNS filter.

> A web page in a tab cannot block other tabs/apps for security reasons — that's
> why the enforcement lives here (and, later, in the desktop app).

## Install (developer mode)

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked** and select this `extension/` folder.
4. Open Kipto → **Settings → Blocker**, pick your categories. The extension
   syncs automatically when the Kipto tab is open.

Firefox: `about:debugging` → This Firefox → Load Temporary Add-on → pick
`manifest.json` (MV3 support varies by version).

## How the sync works

`bridge.js` runs only on the Kipto origin, reads the blocker config from the
app's `localStorage` (`pomo:settings.blocker`) plus the live focus flag
(`pomo:blocker-focus`), and relays them to the background service worker, which
rebuilds the block rules. You can also toggle categories directly in the
extension popup.

## Blocking mechanism

Manifest V3 `declarativeNetRequest` dynamic rules. Top-level navigations to a
blocked domain are redirected to a friendly `blocked.html`; sub-resources are
hard-blocked. Domain rules use `||domain^`, so subdomains are covered.

## Categories

Curated, high-impact lists in `categories.js` (the tempting sites that actually
derail focus). For exhaustive lists (e.g. the full HaGeZi feeds) and wildcard
coverage, that's the job of the desktop/DNS track. Extend coverage anytime via
your **personal block list** in Kipto.

## Notes / limits

- Curated lists keep rules well within Chrome's dynamic-rule budget.
- "Only during focus" requires the Kipto tab to be open so the live focus
  signal can reach the extension.
- This blocks the **browser only**. System-wide blocking = the desktop app.
