#!/usr/bin/env bash
# Focus Flow guardian watchdog. Runs as root from a LaunchDaemon every 30s and
# re-asserts the managed-policy lock across the installed Chromium browsers
# (Chrome, Brave, Edge): if the ExtensionSettings entry, the crx or update.xml
# get deleted, it heals them. Quiet unless it actually repairs.
set -u

EXT_ID="agghgncnlmekjhehiconlkokhdcclchn"
SUPPORT="/Library/Application Support/FocusFlow"
BACKUP="/usr/local/share/focusflow"          # root-only second copy
PB="/usr/libexec/PlistBuddy"
UPDATE_URL="https://clients2.google.com/service/update2/crx"  # Chrome Web Store
changed=0

# Each Chromium browser: app bundle (skip if not installed) + its managed policy.
APPS=(
  "/Applications/Google Chrome.app|/Library/Managed Preferences/com.google.Chrome.plist"
  "/Applications/Brave Browser.app|/Library/Managed Preferences/com.brave.Browser.plist"
  "/Applications/Microsoft Edge.app|/Library/Managed Preferences/com.microsoft.Edge.plist"
)

# 1. Restore the staged crx / update.xml from the backup if removed.
mkdir -p "$SUPPORT"
for f in focusflow-blocker.crx update.xml; do
  if [ ! -f "$SUPPORT/$f" ] && [ -f "$BACKUP/$f" ]; then
    cp -f "$BACKUP/$f" "$SUPPORT/$f"; changed=1
  fi
done
chown -R root:wheel "$SUPPORT" 2>/dev/null || true
chmod -R go-w "$SUPPORT" 2>/dev/null || true

# 2. For each installed browser, ensure the policy force-installs our id.
assert_policy() {
  POLICY="$1"
  mkdir -p "$(dirname "$POLICY")"   # /Library/Managed Preferences may not exist yet
  if [ ! -f "$POLICY" ]; then
    /bin/cat > "$POLICY" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict/></plist>
PLIST
    changed=1
  fi
  mode="$("$PB" -c "Print :ExtensionSettings:$EXT_ID:installation_mode" "$POLICY" 2>/dev/null || true)"
  url="$("$PB" -c "Print :ExtensionSettings:$EXT_ID:update_url" "$POLICY" 2>/dev/null || true)"
  if [ "$mode" != "force_installed" ] || [ "$url" != "$UPDATE_URL" ]; then
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
}

for entry in "${APPS[@]}"; do
  APP="${entry%%|*}"
  POLICY="${entry#*|}"
  [ -d "$APP" ] || continue   # browser not installed -> nothing to lock
  assert_policy "$POLICY"
done

if [ "$changed" = "1" ]; then
  killall cfprefsd 2>/dev/null || true
  echo "$(date '+%F %T') repaired lock" >> /var/log/focusflow-guardian.log
fi
exit 0
