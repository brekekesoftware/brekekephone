#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf node_modules/.cache/babel* .intlNewEn.json
export EXTRACT_INTL=1
yarn babel src -x .js,.ts,.tsx -d build
rm -rf build
node .intlBuild
