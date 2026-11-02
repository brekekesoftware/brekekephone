#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

bash scripts/ls-files.sh 'png|jpg|gif|ico' | xargs -r -L1 bash -c 'imagemin "$0" --out-dir "$(dirname "$0")"'
