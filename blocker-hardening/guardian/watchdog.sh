#!/usr/bin/env bash
# Focus Flow guardian watchdog. Runs as root from a LaunchDaemon every 30s and
# re-asserts the managed-policy lock: if the ExtensionSettings entry, the crx or
# update.xml get deleted, it heals them. Quiet unless it actually repairs.
set -u

EXT_ID="agghgncnlmekjhehiconlkokhdcclchn"
SUPPORT="/Library/Application Support/FocusFlow"
BACKUP="/usr/local/share/focusflow"          # root-only second copy
POLICY="/Library/Managed Preferences/com.google.Chrome.plist"
PB="/usr/libexec/PlistBuddy"
UPDATE_URL="http://127.0.0.1:8788/update.xml"
changed=0

# 1. Restore the staged crx / update.xml from the backup if removed.
mkdir -p "$SUPPORT"
for f in focusflow-blocker.crx update.xml; do
  if [ ! -f "$SUPPORT/$f" ] && [ -f "$BACKUP/$f" ]; then
    cp -f "$BACKUP/$f" "$SUPPORT/$f"; changed=1
  fi
done
chown -R root:wheel "$SUPPORT" 2>/dev/null || true
chmod -R go-w "$SUPPORT" 2>/dev/null || true

# 2. Ensure the policy file exists and force-installs our id.
if [ ! -f "$POLICY" ]; then
  /bin/cat > "$POLICY" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict/></plist>
PLIST
  changed=1
fi
mode="$("$PB" -c "Print :ExtensionSettings:$EXT_ID:installation_mode" "$POLICY" 2>/dev/null || true)"
if [ "$mode" != "force_installed" ]; then
  "$PB" -c "Delete :ExtensionSettings:$EXT_ID" "$POLICY" 2>/dev/null || true
  "$PB" -c "Add :ExtensionSettings dict" "$POLICY" 2>/dev/null || true
  "$PB" -c "Add :ExtensionSettings:$EXT_ID dict" "$POLICY" 2>/dev/null || true
  "$PB" -c "Add :ExtensionSettings:$EXT_ID:installation_mode string force_installed" "$POLICY" 2>/dev/null || true
  "$PB" -c "Add :ExtensionSettings:$EXT_ID:update_url string $UPDATE_URL" "$POLICY" 2>/dev/null || true
  "$PB" -c "Add :ExtensionSettings:$EXT_ID:toolbar_pin string force_pinned" "$POLICY" 2>/dev/null || true
  chown root:wheel "$POLICY" 2>/dev/null || true
  chmod 644 "$POLICY" 2>/dev/null || true
  changed=1
fi

if [ "$changed" = "1" ]; then
  killall cfprefsd 2>/dev/null || true
  echo "$(date '+%F %T') repaired lock" >> /var/log/focusflow-guardian.log
fi
exit 0
