#!/usr/bin/env bash
# Build a distributable Focus Flow .dmg for macOS.
#
# - If .secrets/apple-signing.env exists and is filled in, Tauri signs the app
#   with your Developer ID and (when notarization creds are present) notarizes
#   and staples it — the result installs with no Gatekeeper warning.
# - Without those creds it still produces a .dmg, but UNSIGNED (users will see
#   "unidentified developer" and must right-click → Open).
#
# Usage:  ./scripts/release-macos.sh
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

ENV_FILE=".secrets/apple-signing.env"
if [ -f "$ENV_FILE" ]; then
  echo "🔑 Loading signing credentials from $ENV_FILE"
  set -a; # shellcheck disable=SC1090
  source "$ENV_FILE"; set +a
else
  echo "⚠️  $ENV_FILE not found — building UNSIGNED."
  echo "    cp .secrets/apple-signing.env.example .secrets/apple-signing.env  and fill it in for a signed build."
fi

export PATH="$HOME/.cargo/bin:$PATH"

if [ -n "${APPLE_SIGNING_IDENTITY:-}" ]; then
  echo "🔏 Signing as: $APPLE_SIGNING_IDENTITY"
  if [ -n "${APPLE_ID:-}${APPLE_API_KEY:-}" ]; then
    echo "📤 Notarization creds detected — Tauri will notarize + staple."
  else
    echo "⚠️  Signed but NOT notarized (no APPLE_ID / APPLE_API_KEY set)."
  fi
else
  echo "ℹ️  Unsigned build (no APPLE_SIGNING_IDENTITY)."
fi

echo "🏗  Building…"
npx tauri build --bundles dmg

echo ""
echo "✅ Done. Artifacts:"
ls -1 "$ROOT"/src-tauri/target/release/bundle/dmg/*.dmg 2>/dev/null || echo "  (no .dmg produced)"

# Verification helpers (only meaningful for a signed build):
DMG="$(ls -1 "$ROOT"/src-tauri/target/release/bundle/dmg/*.dmg 2>/dev/null | head -1 || true)"
APP="$ROOT/src-tauri/target/release/bundle/macos/Focus Flow.app"
if [ -n "${APPLE_SIGNING_IDENTITY:-}" ] && [ -d "$APP" ]; then
  echo ""
  echo "🔎 codesign verify:"; codesign --verify --deep --strict --verbose=2 "$APP" 2>&1 | tail -3 || true
  echo "🔎 Gatekeeper assessment:"; spctl -a -t exec -vvv "$APP" 2>&1 | tail -3 || true
fi
[ -n "$DMG" ] && echo "" && echo "👉 Distribute: $DMG"
