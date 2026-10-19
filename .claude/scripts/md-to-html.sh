#!/usr/bin/env bash
# 2026-10-19: report .md files had to become .html pages for nginx, with every cited file a working relative link.
# Usage: md-to-html.sh <upload root dir> <file.md>...   Writes <file>.html next to each .md.
# Each linked folder gets an index.html listing its files (nginx autoindex may be off); an index it did not write stays.
# Then checks every relative href in the pages points to a file or folder inside the root. Prints PASS or FAIL.
set -uo pipefail
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$1" && pwd -P); shift
mds=()
for f in "$@"; do mds+=("$(cd "$(dirname "$f")" && pwd -P)/$(basename "$f")"); done
css='body{font:15px/1.5 -apple-system,Segoe UI,sans-serif;max-width:1100px;margin:2em auto;padding:0 1em}
table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px;vertical-align:top}
pre{background:#f5f5f5;padding:8px;overflow-x:auto;font-size:13px}code{font-size:90%}'
bad=0
for md in "${mds[@]}"; do
  html=${md%.md}.html
  ROOT=$root BUILT="${mds[*]}" pandoc "$md" -f gfm -t html5 --standalone --lua-filter "$here/md-to-html-links.lua" \
    --metadata pagetitle="$(basename "${md%.md}")" -V "header-includes=<style>$css</style>" -o "$html" || { echo "pandoc failed: $md"; bad=1; }
done
mark='<!-- md-to-html folder index -->'
write_index() {
  local d=$1 idx=$1/index.html e
  if [ -f "$idx" ] && ! rg -qF -- "$mark" "$idx"; then echo "kept own index: $idx"; return; fi
  {
    echo "<!doctype html>$mark<meta charset=utf-8><title>$(basename "$d")</title><style>$css</style>"
    echo "<h1>$(basename "$d")/</h1><ul><li><a href=\"../\">../</a></li>"
    for e in "$d"/*; do
      [ "$e" = "$idx" ] && continue
      e=$(basename "$e")
      if [ -d "$d/$e" ]; then echo "<li><a href=\"$e/\">$e/</a></li>"; else echo "<li><a href=\"$e\">$e</a></li>"; fi
    done
    echo "</ul>"
  } >"$idx"
  for e in "$d"/*/; do [ -d "$e" ] && write_index "${e%/}"; done
}
for md in "${mds[@]}"; do
  html=${md%.md}.html
  [ -f "$html" ] || continue
  while IFS= read -r h; do
    [[ $h == */ && ! $h =~ ^[a-z]+: ]] && [ -d "$(dirname "$html")/$h" ] && write_index "$(cd "$(dirname "$html")/$h" && pwd -P)"
  done < <(rg -o 'href="[^"]*"' "$html" | sed 's/^href="//; s/"$//')
done
for md in "${mds[@]}"; do
  html=${md%.md}.html
  [ -f "$html" ] || continue
  dir=$(dirname "$html") n=0
  while IFS= read -r h; do
    [[ $h =~ ^[a-z]+: || $h == \#* ]] && continue
    n=$((n + 1))
    if [ ! -e "$dir/$h" ]; then echo "broken link in $(basename "$html"): $h"; bad=1; continue; fi
    case "$(python3 -c 'import os,sys;print(os.path.realpath(sys.argv[1]))' "$dir/$h")" in
      "$root"/*) ;; *) echo "link outside $root in $(basename "$html"): $h"; bad=1 ;;
    esac
  done < <(rg -o 'href="[^"]*"' "$html" | sed 's/^href="//; s/"$//')
  echo "$(basename "$html"): $n links"
done
[ $bad = 0 ] && echo PASS || echo FAIL
