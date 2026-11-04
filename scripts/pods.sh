#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

cd ios
rm -rf Pods ~/Library/Caches/CocoaPods
pod deintegrate
pod setup
pod install --repo-update
