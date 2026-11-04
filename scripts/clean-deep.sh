#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf node_modules ios/build ios/Pods ~/Library/Developer/Xcode/DerivedData/* android/.gradle android/app/.cxx android/build ~/.gradle/caches ~/.gradle/daemon $TMPDIR/react-native* $TMPDIR/metro* $TMPDIR/haste-map*
yarn --ignore-engines --check-files
cd ios
pod cache clean --all
pod deintegrate
pod install --repo-update
cd ../android
./gradlew clean
