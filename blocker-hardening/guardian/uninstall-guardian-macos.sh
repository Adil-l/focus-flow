#!/usr/bin/env bash
set -euo pipefail

# Reverse install-guardian-macos.sh. Order matters: stop the watchdog FIRST so it
# can't re-heal while we tear the policy down. Admin-only — the single escape hatch.

[ "$(id -u)" = "0" ] || { echo "Run with sudo:  sudo \"$0\""; exit 1; }

EXT_ID="agghgncnlmekjhehiconlkokhdcclchn"
WD_DAEMON="/Library/LaunchDaemons/app.focusflow.guardian.plist"
SV_DAEMON="/Library/LaunchDaemons/app.focusflow.updateserver.plist"
POLICY="/Library/Managed Preferences/com.google.Chrome.plist"
SUPPORT="/Library/Application Support/FocusFlow"
BACKUP="/usr/local/share/focusflow"
PB="/usr/libexec/PlistBuddy"

# 1. Stop + remove both daemons (watchdog first so it can't re-heal).
launchctl bootout system "$WD_DAEMON" 2>/dev/null || true
launchctl bootout system "$SV_DAEMON" 2>/dev/null || true
rm -f "$WD_DAEMON" "$SV_DAEMON"

# 2. Drop the policy entry + staged files.
if [ -f "$POLICY" ]; then
  "$PB" -c "Delete :ExtensionSettings:$EXT_ID" "$POLICY" 2>/dev/null || true
  /usr/bin/plutil -lint "$POLICY" >/dev/null 2>&1 || true
fi
rm -rf "$SUPPORT" "$BACKUP"
killall cfprefsd 2>/dev/null || true

echo "✓ guardian + update server + lock removed"
echo "Quit & reopen Chrome — the extension is removable again."
