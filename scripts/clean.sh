#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

yarn --ignore-engines --check-files
rm -rf ios/build/* ~/Library/Developer/Xcode/DerivedData/*
cd ios
pod install --repo-update
cd ..
yarn jetify
cd android
./gradlew clean
