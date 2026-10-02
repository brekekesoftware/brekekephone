#!/bin/sh
# Guard (2026-10-02): filesize 11.0.25 put BigInt literals (10n) in the bundle; Hermes cannot parse
# them and the app froze on the splash screen. Usage: scripts/check-bundle-bigint.sh <bundle file>
# Build one with: npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output <file>
set -eu
f=${1:?usage: check-bundle-bigint.sh <bundle file>}
if rg -q -e '[(=,:?*+\-]\d[\d_]*n\*\*' -e '[(=,:?*+\-]\d[\d_]*n[,;)]' "$f"; then
  echo "FAIL: BigInt literal in $f (Hermes cannot parse it). Find the package:" >&2
  rg -o -e '.{0,30}[(=,:?*+\-]\d[\d_]*n(\*\*|[,;)]).{0,30}' "$f" | head -3 >&2
  exit 1
fi
echo "ok: no BigInt literals in $f"
