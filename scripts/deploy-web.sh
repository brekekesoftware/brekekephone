#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

SSH_TARGET=${DEV01_SSH:-ubuntu@dev01.brekeke.com}
WEB_DIR=${DEPLOY_WEB_DIR:-/var/www/phone}
V=$(jq -r .version package.json)
ZIP=${ZIP_NAME:-brekeke_phone$V.zip}

case "$WEB_DIR" in /var/www/?*) ;; *) echo "DEPLOY_WEB_DIR must be under /var/www/" >&2; exit 1 ;; esac

DISABLE_ESLINT_PLUGIN=true bash scripts/build.sh

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
(cd build && zip -qr "$TMP/$ZIP" .)

scp -o StrictHostKeyChecking=accept-new "$TMP/$ZIP" "$SSH_TARGET:/var/www/upload/$ZIP"
ssh -o StrictHostKeyChecking=accept-new "$SSH_TARGET" "set -e; rm -rf '$WEB_DIR.new'; mkdir '$WEB_DIR.new'; unzip -q '/var/www/upload/$ZIP' -d '$WEB_DIR.new'; rm -rf '$WEB_DIR.bak'; if [ -d '$WEB_DIR' ]; then mv '$WEB_DIR' '$WEB_DIR.bak'; fi; mv '$WEB_DIR.new' '$WEB_DIR'"
echo "deployed $ZIP to $SSH_TARGET:$WEB_DIR (previous one in $WEB_DIR.bak)"
