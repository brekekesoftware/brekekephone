#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

git ls-files -c -o --exclude-standard | { grep -E "\.($1)\$" || [ $? -eq 1 ]; } | while read -r f; do if [ -f "$f" ]; then echo "$f"; fi; done
