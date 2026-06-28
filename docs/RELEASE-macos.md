# Releasing Kipto for macOS (signed + notarized DMG)

This produces a `.dmg` that installs on any Mac with **no Gatekeeper warning**.

## What you need (one-time)
1. **Apple Developer Program** membership — $99/year: https://developer.apple.com/programs/
2. A **Developer ID Application** certificate:
   - Easiest: open **Xcode → Settings → Accounts → (your team) → Manage Certificates → + → Developer ID Application**.
   - Or create it at https://developer.apple.com/account/resources/certificates and double-click the downloaded `.cer` to add it to your login keychain.
   - Verify it's installed:
     ```
     security find-identity -v -p codesigning
     ```
     You should see `Developer ID Application: <Name> (<TEAMID>)`.
3. An **app-specific password** for notarization: https://appleid.apple.com → Sign-In & Security → App-Specific Passwords.
   (Find your **Team ID** at https://developer.apple.com/account → Membership.)

## Configure credentials (local only)
```
cp .secrets/apple-signing.env.example .secrets/apple-signing.env
# edit .secrets/apple-signing.env and fill in:
#   APPLE_SIGNING_IDENTITY, APPLE_ID, APPLE_PASSWORD, APPLE_TEAM_ID
```
`.secrets/` is git-ignored — these never leave your Mac.

## Build
```
./scripts/release-macos.sh
```
- With creds → signed, notarized, stapled `.dmg`.
- Without creds → unsigned `.dmg` (fine for testing on your own Mac; others get the "unidentified developer" warning).

Output: `src-tauri/target/release/bundle/dmg/Kipto_1.0.0_aarch64.dmg`

## Verify a signed build
```
codesign --verify --deep --strict --verbose=2 "src-tauri/target/release/bundle/macos/Kipto.app"
spctl -a -t exec -vvv "src-tauri/target/release/bundle/macos/Kipto.app"   # expect: accepted, source=Notarized Developer ID
xcrun stapler validate "src-tauri/target/release/bundle/dmg/Kipto_1.0.0_aarch64.dmg"
```

## Notes
- Already configured in `tauri.conf.json`: `dmg` target, `hardenedRuntime: true`,
  `entitlements.plist`, category, copyright, `minimumSystemVersion 11.0`.
- Tauri auto-signs when `APPLE_SIGNING_IDENTITY` is set and auto-notarizes when
  `APPLE_ID`/`APPLE_PASSWORD`/`APPLE_TEAM_ID` (or the API-key vars) are set.
- The app is **Apple-silicon (aarch64)**. For an Intel/universal build, install the
  `x86_64-apple-darwin` Rust target and build with `--target universal-apple-darwin`.
- First notarization can take a few minutes (Apple's service). Keep the machine awake.
- The privileged blocker (`/etc/hosts`) and the break kiosk still work under the
  hardened runtime — they go through Authorization Services / NSApplication, which
  notarization does not restrict.
