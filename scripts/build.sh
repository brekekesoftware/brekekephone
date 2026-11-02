#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf node_modules/.cache/babel* .intlNewEn.json
yarn vite build "$@"
node .embed
