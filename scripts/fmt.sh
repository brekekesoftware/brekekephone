#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

yarn lint
bash scripts/ls-files.sh 'h|m' | xargs -r clang-format-11 -i -style=file
swiftformat ios
bash scripts/ls-files.sh 'java' | xargs -r google-java-format -i
bash scripts/ls-files.sh 'kt' | xargs -r ktfmt -i
bash scripts/ls-files.sh 'xml|storyboard|xcscheme|xcworkspacedata' | xargs -r yarn -s prettier --plugin=@prettier/plugin-xml --parser=xml --xml-whitespace-sensitivity=ignore --log-level=error --write
