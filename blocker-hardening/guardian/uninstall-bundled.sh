#!/usr/bin/env bash
set -euo pipefail

# Self-contained uninstaller, run from inside the Deactivate app bundle.
# Stops both daemons (watchdog first so it can't re-heal), drops the policy entry
# and the staged files. Admin-only.

EXT_ID="agghgncnlmekjhehiconlkokhdcclchn"
WD_DAEMON="/Library/LaunchDaemons/app.focusflow.guardian.plist"
SV_DAEMON="/Library/LaunchDaemons/app.focusflow.updateserver.plist"
POLICY="/Library/Managed Preferences/com.google.Chrome.plist"
PB="/usr/libexec/PlistBuddy"

launchctl bootout system "$WD_DAEMON" 2>/dev/null || true
launchctl bootout system "$SV_DAEMON" 2>/dev/null || true
rm -f "$WD_DAEMON" "$SV_DAEMON"

if [ -f "$POLICY" ]; then
  "$PB" -c "Delete :ExtensionSettings:$EXT_ID" "$POLICY" 2>/dev/null || true
fi
rm -rf "/Library/Application Support/FocusFlow" "/usr/local/share/focusflow"
killall cfprefsd 2>/dev/null || true

echo "ok"
