#!/usr/bin/env bash
# Build a SIGNED Kipto desktop release and prepare the auto-update manifest.
#
# Produces (in src-tauri/target/release/bundle/):
#   macos/Kipto.app.tar.gz       — the updater payload
#   macos/Kipto.app.tar.gz.sig   — its signature (verified by the pubkey in tauri.conf.json)
#   macos/latest.json            — the manifest the in-app updater fetches
#   dmg/Kipto_<ver>_aarch64.dmg  — the installer for new users
#
# Then publish a GitHub Release tagged v<version> with Kipto.app.tar.gz + latest.json
# (+ the DMG) so the endpoint in tauri.conf.json resolves and installed apps update.
#
# The signing PRIVATE key lives OUTSIDE the repo (~/.kipto/updater.key) and must
# never be committed. Losing it = can't ship updates to existing installs.
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.cargo/bin:$PATH"

KEY_FILE="$HOME/.kipto/updater.key"
export TAURI_SIGNING_PRIVATE_KEY="${TAURI_SIGNING_PRIVATE_KEY:-$(cat "$KEY_FILE")}"
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="${TAURI_SIGNING_PRIVATE_KEY_PASSWORD:-}"

VERSION=$(node -p "require('./src-tauri/tauri.conf.json').version")
REPO="Adil-l/focus-flow"
TAG="v${VERSION}"
BUNDLE="src-tauri/target/release/bundle/macos"

echo "▶ Building signed bundles for ${TAG}…"
npx tauri build --bundles app,dmg

SIG=$(cat "$BUNDLE/Kipto.app.tar.gz.sig")
cat > "$BUNDLE/latest.json" <<JSON
{
  "version": "${VERSION}",
  "notes": "Kipto ${VERSION}",
  "pub_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "platforms": {
    "darwin-aarch64": {
      "signature": "${SIG}",
      "url": "https://github.com/${REPO}/releases/download/${TAG}/Kipto.app.tar.gz"
    }
  }
}
JSON
echo "✓ Wrote $BUNDLE/latest.json"

DMG="src-tauri/target/release/bundle/dmg/Kipto_${VERSION}_aarch64.dmg"
if command -v gh >/dev/null 2>&1; then
  echo "▶ Publishing GitHub Release ${TAG}…"
  gh release create "$TAG" "$BUNDLE/Kipto.app.tar.gz" "$BUNDLE/latest.json" "$DMG" \
    --repo "$REPO" --title "Kipto ${VERSION}" --notes "Kipto ${VERSION}" 2>/dev/null \
  || gh release upload "$TAG" "$BUNDLE/Kipto.app.tar.gz" "$BUNDLE/latest.json" "$DMG" --repo "$REPO" --clobber
  echo "✓ Released ${TAG}"
else
  echo
  echo "gh CLI not found. Create the GitHub Release manually:"
  echo "  1. https://github.com/${REPO}/releases/new  (tag: ${TAG})"
  echo "  2. Upload these assets:"
  echo "       $BUNDLE/Kipto.app.tar.gz"
  echo "       $BUNDLE/latest.json"
  echo "       $DMG"
fi
