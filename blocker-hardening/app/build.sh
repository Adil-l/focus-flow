#!/usr/bin/env bash
set -euo pipefail

# Build the self-contained Activate/Deactivate apps and install them to
# ~/Applications (a non-TCC-protected location, unlike ~/Documents). Each app
# carries its full payload in Contents/Resources so it works without the repo.
#
# Usage: ./build.sh [DEST_DIR]   (default DEST: ~/Applications)

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARD="$(cd "$HERE/.." && pwd)"
DEST="${1:-$HOME/Applications}"

[ -f "$HARD/dist/focusflow-blocker.crx" ] || ( cd "$HARD" && /bin/bash ./pack.sh )

mkdir -p "$DEST"

build_app () {
  local name="$1" src="$2" script="$3"
  local app="$DEST/$name.app"
  rm -rf "$app"
  /usr/bin/osacompile -o "$app" "$HERE/$src.applescript"
  local res="$app/Contents/Resources"
  cp -f "$HARD/dist/focusflow-blocker.crx" "$res/"
  cp -f "$HARD/dist/update.xml" "$res/"
  cp -f "$HARD/guardian/watchdog.sh" "$res/"
  cp -f "$HARD/guardian/app.focusflow.updateserver.plist" "$res/"
  cp -f "$HARD/guardian/app.focusflow.guardian.plist" "$res/"
  cp -f "$HARD/guardian/$script" "$res/$script"
  chmod 755 "$res/$script" "$res/watchdog.sh"
}

build_app "Activate Focus Flow Protection"   activate   install-bundled.sh
build_app "Deactivate Focus Flow Protection" deactivate uninstall-bundled.sh

echo "✓ built self-contained apps into: $DEST"
echo "  • Activate Focus Flow Protection.app"
echo "  • Deactivate Focus Flow Protection.app"
