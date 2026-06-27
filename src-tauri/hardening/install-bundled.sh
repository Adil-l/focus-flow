#!/usr/bin/env bash
set -euo pipefail

# Self-contained installer — runs from INSIDE the .app bundle
# (Contents/Resources). It reads its whole payload from its own directory, so it
# never touches the project repo and never trips macOS TCC on ~/Documents.
# Invoked by the Activate app via `do shell script … with administrator privileges`.

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUPPORT="/Library/Application Support/FocusFlow"
BACKUP="/usr/local/share/focusflow"
SV_DAEMON="/Library/LaunchDaemons/app.focusflow.updateserver.plist"
WD_DAEMON="/Library/LaunchDaemons/app.focusflow.guardian.plist"

# 1. Stage + back up the crx, update.xml and watchdog (root-owned, non-writable).
mkdir -p "$SUPPORT" "$BACKUP"
cp -f "$HERE/focusflow-blocker.crx" "$HERE/update.xml" "$SUPPORT/"
cp -f "$HERE/focusflow-blocker.crx" "$HERE/update.xml" "$BACKUP/"
cp -f "$HERE/watchdog.sh" "$SUPPORT/watchdog.sh"
chown -R root:wheel "$SUPPORT" "$BACKUP"
chmod -R go-w "$SUPPORT" "$BACKUP"
chmod 755 "$SUPPORT/watchdog.sh"

# 2. Install both LaunchDaemons (update server + self-healing watchdog).
cp -f "$HERE/app.focusflow.updateserver.plist" "$SV_DAEMON"
cp -f "$HERE/app.focusflow.guardian.plist" "$WD_DAEMON"
chown root:wheel "$SV_DAEMON" "$WD_DAEMON"
chmod 644 "$SV_DAEMON" "$WD_DAEMON"

launchctl bootout system "$SV_DAEMON" 2>/dev/null || true
launchctl bootstrap system "$SV_DAEMON"
launchctl enable system/app.focusflow.updateserver 2>/dev/null || true
launchctl bootout system "$WD_DAEMON" 2>/dev/null || true
launchctl bootstrap system "$WD_DAEMON"
launchctl enable system/app.focusflow.guardian 2>/dev/null || true

# 3. Write the managed policy now (don't wait for the watchdog's first tick).
/bin/bash "$SUPPORT/watchdog.sh" 2>/dev/null || true

echo "ok"
