#!/usr/bin/env bash
set -euo pipefail

# One-shot installer for the browser-side lock (Camadas 2 + 3):
#   • a local UPDATE SERVER (127.0.0.1:8788) Chrome force-installs the crx from
#     (Chrome rejects file:// update_urls, so we self-host over localhost);
#   • a self-healing WATCHDOG that re-asserts the managed policy every 30s.
# Result: chrome://extensions shows "Installed by enterprise policy" with no
# Remove/Disable button, and deleting the policy/crx self-heals.
# Admin-only; fully reversible via uninstall-guardian-macos.sh.

[ "$(id -u)" = "0" ] || { echo "Run with sudo:  sudo \"$0\""; exit 1; }

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST="$(cd "$HERE/.." && pwd)/dist"
SUPPORT="/Library/Application Support/FocusFlow"
BACKUP="/usr/local/share/focusflow"
WD_DAEMON="/Library/LaunchDaemons/app.focusflow.guardian.plist"
SV_DAEMON="/Library/LaunchDaemons/app.focusflow.updateserver.plist"

[ -f "$DIST/focusflow-blocker.crx" ] || { echo "✗ run ../pack.sh first"; exit 1; }
[ -f "$DIST/update.xml" ] || { echo "✗ run ../pack.sh first"; exit 1; }

# 1. Stage + back up the crx, update.xml and watchdog (root-owned, non-writable).
mkdir -p "$SUPPORT" "$BACKUP"
cp -f "$DIST/focusflow-blocker.crx" "$DIST/update.xml" "$SUPPORT/"
cp -f "$DIST/focusflow-blocker.crx" "$DIST/update.xml" "$BACKUP/"
cp -f "$HERE/watchdog.sh" "$SUPPORT/watchdog.sh"
chown -R root:wheel "$SUPPORT" "$BACKUP"
chmod -R go-w "$SUPPORT" "$BACKUP"
chmod 755 "$SUPPORT/watchdog.sh"

# 2. Update server daemon (serves the crx + update.xml to Chrome on localhost).
cp -f "$HERE/app.focusflow.updateserver.plist" "$SV_DAEMON"
chown root:wheel "$SV_DAEMON"; chmod 644 "$SV_DAEMON"
launchctl bootout system "$SV_DAEMON" 2>/dev/null || true
launchctl bootstrap system "$SV_DAEMON"
launchctl enable system/app.focusflow.updateserver 2>/dev/null || true

# 3. Watchdog daemon (writes the policy on load, re-asserts every 30s).
cp -f "$HERE/app.focusflow.guardian.plist" "$WD_DAEMON"
chown root:wheel "$WD_DAEMON"; chmod 644 "$WD_DAEMON"
launchctl bootout system "$WD_DAEMON" 2>/dev/null || true
launchctl bootstrap system "$WD_DAEMON"
launchctl enable system/app.focusflow.guardian 2>/dev/null || true

# 4. Confirm the update server is actually answering before we send you to Chrome.
sleep 1
if /usr/bin/curl -fsS "http://127.0.0.1:8788/update.xml" >/dev/null 2>&1; then
  echo "✓ update server answering on http://127.0.0.1:8788"
else
  echo "⚠ update server not answering yet — see /var/log/focusflow-updateserver.log"
  echo "  (is /usr/bin/python3 present? is port 8788 free?)"
fi

echo "✓ watchdog + update server loaded; policy asserted"
echo
echo "Now FULLY quit Chrome (Cmd-Q) and reopen it."
echo "chrome://policy    → ExtensionSettings shows agghgncnlmekjhehiconlkokhdcclchn"
echo "chrome://extensions→ 'Installed by enterprise policy', NO Remove button."
echo
echo "Remove later (admin only):  sudo \"$HERE/uninstall-guardian-macos.sh\""
