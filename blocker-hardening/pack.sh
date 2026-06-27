#!/usr/bin/env bash
set -euo pipefail

# Pack the Focus Flow Blocker into a signed .crx and generate update.xml, so the
# extension can be force-installed offline via macOS managed policy.
#
# We pack a CLEAN STAGING COPY containing only the runtime files — never the
# hardening/ tooling and never the signing key (Chrome refuses to pack a folder
# that contains a .pem, and we don't want scripts shipped inside the crx).
#
# Requires: Google Chrome (--pack-extension) and the signing key whose public
# half is pinned in extension/manifest.json ("key"). ID is fixed at:
#   agghgncnlmekjhehiconlkokhdcclchn
#
# The private key (ff_signing_key.pem) is your build's identity — keep it safe.

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXT_DIR="$(cd "$HERE/../extension" && pwd)"
DIST="$HERE/dist"
STAGE="$DIST/staging"
EXT_ID="agghgncnlmekjhehiconlkokhdcclchn"

KEY="${FF_SIGNING_KEY:-$HERE/ff_signing_key.pem}"
CHROME="${CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

[ -f "$KEY" ] || { echo "✗ signing key not found at $KEY (set FF_SIGNING_KEY)"; exit 1; }
[ -x "$CHROME" ] || { echo "✗ Chrome not found at $CHROME (set CHROME_BIN)"; exit 1; }

VERSION="$(/usr/bin/python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["version"])' "$EXT_DIR/manifest.json")"

# 1. Build a clean staging dir: top-level runtime files only.
rm -rf "$STAGE"
mkdir -p "$STAGE"
( cd "$EXT_DIR" && /usr/bin/find . -maxdepth 1 -type f \
    \( -name 'manifest.json' -o -name '*.js' -o -name '*.html' -o -name '*.png' \) \
    -exec cp {} "$STAGE/" \; )

# The crx's identity comes from the signing key; the manifest "key" is only
# needed so the *unpacked* dev copy shares the same ID. Drop it from the staged
# manifest to avoid any pack-time key conflict — ID stays identical.
/usr/bin/python3 - "$STAGE/manifest.json" <<'PY'
import json, sys
p = sys.argv[1]
m = json.load(open(p))
m.pop("key", None)
json.dump(m, open(p, "w"), indent=2)
PY

# 2. Pack the staging dir; Chrome writes <parent>/staging.crx.
"$CHROME" --pack-extension="$STAGE" --pack-extension-key="$KEY" --no-message-box >/dev/null 2>&1 || true
SRC_CRX="$DIST/staging.crx"
[ -f "$SRC_CRX" ] || { echo "✗ pack failed — no crx produced (key valid? Chrome installed?)"; exit 1; }
mv -f "$SRC_CRX" "$DIST/focusflow-blocker.crx"
rm -rf "$STAGE"

# 3. Update manifest served by the local update server (127.0.0.1:8788). Chrome
# rejects file:// update_urls for force-install, so we self-host over localhost.
cat > "$DIST/update.xml" <<XML
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='$EXT_ID'>
    <updatecheck codebase='http://127.0.0.1:8788/focusflow-blocker.crx' version='$VERSION' />
  </app>
</gupdate>
XML

# 4. Mirror the payload the Tauri app bundles (src-tauri/hardening/), so the
# app's force-installed extension always matches this pack. These files are
# committed: the signing key isn't available off this machine, so the crx can't
# be regenerated elsewhere — the build must ship the committed copy.
APPHARD="$(cd "$HERE/.." && pwd)/src-tauri/hardening"
mkdir -p "$APPHARD"
cp -f "$DIST/focusflow-blocker.crx" "$DIST/update.xml" \
      "$HERE/guardian/watchdog.sh" \
      "$HERE/guardian/app.focusflow.updateserver.plist" \
      "$HERE/guardian/app.focusflow.guardian.plist" \
      "$HERE/guardian/install-bundled.sh" \
      "$HERE/guardian/uninstall-bundled.sh" \
      "$APPHARD/"

echo "✓ packed v$VERSION  -> $DIST/focusflow-blocker.crx"
echo "✓ update manifest   -> $DIST/update.xml"
echo "✓ synced app payload-> src-tauri/hardening/"
echo "  next: rebuild the app, or sudo \"$HERE/guardian/install-guardian-macos.sh\""
