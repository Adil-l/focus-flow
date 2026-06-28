# Publishing Kipto Blocker to the Chrome Web Store

**Why:** Chrome refuses to force-install a *self-hosted* extension on a Mac that
isn't enterprise-managed (it shows `[BLOCKED]` in `chrome://policy`). On an
unmanaged machine the force-install policy only works for extensions **hosted on
the Chrome Web Store**. So we publish there; then the existing guardian policy
(re-pointed at the Store) auto-installs it with no manual step — even unmanaged.

The submission package is built: **`kipto-blocker-webstore.zip`** (repo root).

---

## 1. One-time setup (you)
1. Go to the **Chrome Web Store Developer Dashboard**:
   https://chrome.google.com/webstore/devconsole
2. Sign in with the Google account you want to own the listing.
3. Pay the **one-time US$5** developer registration fee.

## 2. Create the item
1. Dashboard → **“Add new item”**.
2. Upload **`kipto-blocker-webstore.zip`**.
3. After it processes, note the **Item ID** shown in the dashboard URL
   (`.../devconsole/.../<ITEM_ID>/`). **Send me that ID** — I confirm/repoint the
   guardian to it. (We kept the manifest `key`, so it should be
   `agghgncnlmekjhehiconlkokhdcclchn`; if the dashboard shows a different one,
   tell me and I update everything.)
   - If the upload complains about the `key` field, remove it and re-zip — but
     then the ID changes, so send me the new one.

## 3. Listing (paste this)

**Name:** Kipto Blocker

**Summary (≤132 chars):**
> Block distracting, gambling, adult and ad/pop-up sites by category, close ad pop-unders, and hide sponsored posts — synced with Kipto.

**Category:** Productivity → Workflow & Planning

**Description:**
> Kipto Blocker is the companion to the Kipto focus app. It blocks the
> sites and ads that derail focus — by category you control:
>
> • Distracting / social, gambling, adult, piracy, ads & pop-ups
> • Closes ad pop-under tabs automatically
> • Removes anti-adblock “disable your ad blocker” walls
> • Hides sponsored/promoted posts on social feeds
> • Optional “focus only” mode and a mandatory-break takeover
>
> Your category choices sync from the Kipto app. No account, no tracking —
> all settings stay on your device.

**Language:** English (add Portuguese if you like).

**Screenshots (1280×800 or 640×400, at least 1 — you capture):**
1. The extension popup showing the category toggles.
2. A “Site blocked” page (visit a blocked site with a category on).
3. (optional) A social feed with sponsored posts hidden.

## 4. Privacy tab (required)

**Single purpose:**
> Block distracting and unwanted websites and ads during focus sessions,
> configured by the user’s Kipto app.

**Permission justifications:**
- **declarativeNetRequest** — Block ad/gambling/adult/distracting domains by
  category using efficient declarative network rules.
- **storage** — Store the user’s block configuration (which categories are on)
  locally.
- **tabs** — Detect and close ad pop-under tabs and apply the focus/break state
  across tabs.
- **host permissions `<all_urls>`** — Apply blocking, close ad pop-ups, remove
  anti-adblock walls and hide sponsored posts on the sites the user chooses.

**Data usage:** Tick that you do **not** collect or sell user data.
> All configuration is stored locally and synced only from the user’s own Focus
> Flow app on the same machine. The extension transmits no personal data.

**Privacy policy URL (required):** a public page, e.g. `https://kipto.xyz/privacy`.
(Make sure that page exists and states the above.)

## 5. Submit
- **Visibility:** Unlisted is fine (force-install by policy still works; it just
  won’t show in search). Public also fine.
- Click **Submit for review**. Review usually takes **~1–3 days** (can be longer
  for `<all_urls>` + broad permissions — be ready to answer a reviewer email).

## 6. After it’s approved (me)
Send me the **Item ID**. I then:
- Re-point the guardian policy’s `update_url` to the Web Store
  (`https://clients2.google.com/service/update2/crx`) and drop the localhost
  update server,
- so the app force-installs it from the Store automatically (no manual step),
- and the `[BLOCKED]` warning disappears.

Until then, the quickest way to use it now is **Load unpacked** (chrome://extensions
→ Developer mode → Load unpacked → the `extension/` folder).
