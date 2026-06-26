# Focus Flow — System Permissions & Consent

**Please read this before enabling the website blocker.**

Focus Flow's website-blocking ("protection") features need to make a few changes to your Mac so that blocking works reliably across all your browsers. We want you to understand **exactly** what those changes are and **why**, before you authorize anything. Nothing described here happens until you turn protection on and explicitly approve it.

**This is a tool you point at yourself.** The whole point of blocking is to let *you* voluntarily make distracting sites harder to reach so you can focus. You set it up; you can take it down.

---

## What Focus Flow Will Do With Your Authorization

When you enable protection, and **only after you approve it**, Focus Flow may perform the following privileged actions:

### (a) Edit the system hosts file (`/etc/hosts`)
To block the sites you choose **system-wide — across every browser** (Safari, Chrome, Firefox, and others) — Focus Flow adds entries to your Mac's `/etc/hosts` file. These entries redirect the domains you selected so they no longer load. We add only the domains tied to your blocklist, inside a clearly marked Focus Flow section, and we leave the rest of the file untouched.

### (b) (Optional) Make the companion browser extension resilient
If you opt in to stronger protection for Chrome, Focus Flow can additionally:
- Install a **Chrome managed-policy entry** that keeps the companion Focus Flow browser extension installed;
- Install a **small local update helper** so the extension stays up to date; and
- Register a **background LaunchDaemon** so the protection stays active and the extension is hard to remove on impulse.

The purpose is purely to keep *you* from quickly disabling your own blocking in a moment of weakness — which is the point of a commitment tool. This is **optional**; basic hosts-file blocking (a) works without it.

### (c) You authorize each privileged action with your own macOS password
Every privileged change is requested through the **native macOS administrator authorization dialog** provided by the operating system. You type your administrator password into that system dialog — not into Focus Flow. **Focus Flow never sees, stores, or transmits your password.** If you cancel the system dialog, the change does not happen.

### (d) Everything is reviewable and fully reversible
You stay in control. From within Focus Flow you can:
- **Review** exactly which domains are blocked and which components are installed;
- **Turn it all off with one click** ("Disable protection"), which removes Focus Flow's `/etc/hosts` entries and removes the managed-policy entry, update helper, and LaunchDaemon described in (b).

Removing protection also uses the native macOS authorization dialog. No change Focus Flow makes is permanent or hidden.

### (e) This is a restriction you choose for yourself
Blocking is something **you voluntarily impose on yourself** to support your own focus and goals. Focus Flow does not block anything on its own and does not decide what's good or bad for you to visit — you do.

---

## What Focus Flow Does **Not** Do

- It does **not** bypass, disable, or weaken macOS security protections (such as System Integrity Protection, Gatekeeper, or code signing).
- It does **not** act without your explicit authorization — every privileged step requires the system password prompt.
- It does **not** monitor, log, or transmit your browsing history. Blocking works by making chosen domains unreachable; it does not watch where you go.
- It does **not** store or send your administrator password anywhere.
- It does **not** install anything for stronger protection (b) unless you specifically opt in.

---

## Informed Consent

By proceeding, you confirm that:

- You **understand** the changes described above and **why** they are made;
- You are an administrator of this Mac and are **authorized** to make these changes;
- You are enabling these features **voluntarily**, for your own focus, on a device you control; and
- You understand the changes are **transparent, reviewable, and fully reversible** from within Focus Flow at any time.

If you do not want Focus Flow to make any system changes, you can use the timer, sounds, and stats features without enabling protection. You can also turn protection off later at any time.

Questions? Contact **[contact email]**.
