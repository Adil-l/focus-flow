# Focus Flow — Privacy Policy

**Last updated: [date]**

Focus Flow is a personal-productivity app for macOS, published by [Your Company]. This Privacy Policy explains how the App handles your information. The short version: **Focus Flow is built to keep your data on your own Mac.**

---

## 1. Our Core Principle: Local First

By default, **everything Focus Flow stores about you stays on your Mac.** This includes:

- Your settings and preferences;
- Your focus statistics and session history;
- Your blocklists and blocking schedules;
- Any password or commitment phrase you set for the protection lock (stored hashed — see Section 4);
- Sound mixes and other personalizations.

**This data is not transmitted to any server by default.** We do not run a server that silently receives your activity. We do not sell or rent your data. We do not show you ads.

## 2. Features That Touch the Network (All Opt-In)

A few features need the internet to work. These are the **only** ways Focus Flow contacts an outside service, and each one is **opt-in** — it happens only because you turned it on or took an action that obviously requires it. We try to keep this list complete and current:

- **Wallpaper / background images.** If you choose to load background images, the App requests images from a third-party image API (for example, a stock-photo or wallpaper provider). This request necessarily reveals your device's IP address and a basic request to that provider, governed by that provider's own privacy policy. If you don't use this feature, no such request is made.
- **Optional cloud sync / sign-in.** If you choose to sign in and enable cloud sync, the data you choose to sync (such as settings and stats) is sent to and stored by the sync service so it can be shared across your devices. This happens only after you sign in and enable it. You can disable sync and stay fully local.
- **Optional AI features.** If you use optional AI-assisted features (such as task breakdown or a focus coach), the text you submit for that feature is sent to the AI provider that powers it solely to generate your response. Don't submit sensitive information you don't want processed by that provider. These features run only when you invoke them.
- **App updates.** The App (or the platform it's installed through) may check for updates. An update check can reveal your IP address and version to the update host.

If any future feature would send data off your device, we will disclose it here and keep it opt-in wherever practical.

## 3. No Analytics or Telemetry Without Consent

We do **not** collect analytics, telemetry, usage tracking, crash reports, or behavioral data without your consent. If we ever offer optional diagnostics (for example, to help us fix a bug), it will be clearly labeled, **off by default**, and something you can turn on or off at any time.

## 4. Passwords and Commitment Phrases

If you set a password or commitment phrase to lock the protection features, it is stored **locally and hashed** using a one-way cryptographic hash — we do not keep a readable copy, and it is not transmitted off your Mac. Because the hash is one-way, **we cannot recover or reset a forgotten phrase for you.** Keep it somewhere safe.

## 5. Where Data Lives, and How to Delete It

Your data is stored locally in your macOS user account, typically in the App's support and preferences folders (for example, under `~/Library/Application Support/` and `~/Library/Preferences/`), and the website blocker writes to the system hosts file (`/etc/hosts`) only when you enable blocking (see the System Permissions Consent document).

**To delete all of your Focus Flow data:**

1. In the App, turn off the website blocker / "Disable protection." This removes Focus Flow's entries from `/etc/hosts` and removes any helper components it installed (this step requests your administrator password).
2. Quit Focus Flow and uninstall it (move the App to the Trash).
3. Remove the App's support files from your user Library, including its folders under `~/Library/Application Support/`, `~/Library/Preferences/`, and `~/Library/Caches/` (folder names will include the Focus Flow identifier).
4. If you enabled cloud sync, sign in to the sync service and delete your synced data, or contact us at **[contact email]** to request deletion of any data held by the sync service.

After these steps, your local data is gone. We cannot retrieve it, and neither can you, so back up anything you want to keep first.

## 6. Children's Privacy

Focus Flow is intended for general audiences and is **not directed to children under 13** (or the equivalent minimum age in your jurisdiction). We do not knowingly collect personal information from children. Because the App stores data locally and does not require an account to use, we generally do not receive children's data at all. If you believe a child has provided personal information to us through an opt-in feature, contact us at **[contact email]** and we will delete it.

## 7. Security

We design the App to keep data local and to use your operating system's own protections. No method of storage or transmission is perfectly secure, but because your data primarily lives on your own device, you remain in control of it. Protect your Mac with a strong account password, disk encryption (FileVault), and timely updates.

## 8. Third-Party Services

When you use an opt-in network feature, your interaction with that third party (image provider, sync service, AI provider, or update host) is also governed by that provider's privacy policy. We encourage you to review the policies of any service you choose to enable.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date and make the new version available within the App. For material changes, we will make a reasonable effort to highlight them. Your continued use after an update means you accept the revised policy.

## 10. Contact

Questions about your privacy or this policy? Contact us at **[contact email]**.
