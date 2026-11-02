#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

SSH_TARGET=${DEV01_SSH:-ubuntu@dev01.brekeke.com}
V=$(jq -r .version package.json)
APK=${APK_NAME:-brekeke_phone$V.apk}

(cd android && ./gradlew clean assembleRelease)
scp -o StrictHostKeyChecking=accept-new android/app/build/outputs/apk/release/app-release.apk "$SSH_TARGET:/var/www/upload/$APK"
echo "uploaded $APK"
