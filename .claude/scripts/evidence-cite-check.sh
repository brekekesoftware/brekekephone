#!/usr/bin/env bash
# 2026-10-19: evidence docs cite files and quote log lines by hand; a wrong path or edited quote went unnoticed.
# Usage: evidence-cite-check.sh <doc.md> <base dir for relative paths> [evidence dir for quotes] [first heading of quotes]
# Checks every `backticked` path that has a / or a file extension exists under <base dir> or the doc's own folder.
# With an evidence dir: every line inside ``` blocks (from the heading on, default "## Quoted") is found word for word
# in that dir, the doc itself excluded; a line "L<n>: text" must be line n of some file there. Prints PASS or FAIL.
set -uo pipefail
doc=$1 base=$2 ev=${3:-} from=${4:-## Quoted}
docdir=$(dirname "$doc")
bad=0
while IFS= read -r p; do
  case "$p" in *' '*|*'<'*|*'*'*|http*|--*|*'='*|*'('*|*'{'*) continue ;; esac
  [[ "$p" == */* || "$p" =~ \.(md|log|txt|json|jsonl|zip|png|xml|html|tsv|mjs|py)$ ]] || continue
  [[ -e "$base/$p" || -e "$docdir/$p" || -e "$p" ]] && continue
  [ -n "$(find "$base" "$docdir" -path "*/${p%/}" -print -quit)" ] && continue
  echo "missing path: $p"; bad=1
done < <(rg -o '`[^`]+`' "$doc" | tr -d '`' | sort -u)
if [ -n "$ev" ]; then
  n=0
  while IFS= read -r line; do
    [ -z "${line// }" ] && continue
    n=$((n + 1))
    num='' text=$line
    if [[ "$line" =~ ^L([0-9]+):\ (.*)$ ]]; then num=${BASH_REMATCH[1]} text=${BASH_REMATCH[2]}; fi
    hits=$(rg -uuu -a -n -F --no-heading --glob "!$(basename "$doc")" -- "$text" "$ev")
    if [ -z "$hits" ] || { [ -n "$num" ] && ! printf '%s\n' "$hits" | rg -q ":$num:"; }; then
      echo "quote not found${num:+ at line $num}: $text"; bad=1
    fi
  done < <(awk -v h="$from" 'index($0,h)==1{on=1} on && /^```/{f=!f; next} on && f' "$doc" | sed -E 's/^ +//; s/ +$//')
  echo "quotes checked: $n"
fi
[ $bad = 0 ] && echo PASS || echo FAIL
