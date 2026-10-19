#!/bin/bash
# 2026-10-19: a poll loop took a QCon outage (curl 28, no JSON) as "run ended". This waits through errors.
# Usage: nohup .claude/scripts/qcon-poll-run.sh <groupId> <log> >/dev/null 2>&1 &
#        then ~/.claude/bin/wait-log <log> --done RUN-ENDED --max 590
# Writes the last status JSON to <log>.final. Prints PASS when the group ended, FAIL on bad args.
[ -n "$1" ] && [ -n "$2" ] || { echo "FAIL usage: $0 <groupId> <log>"; exit 1; }
cd "$(dirname "$0")/../.." || exit 1
while true; do
  out=$(.claude/scripts/qcon-mcp.sh call qcon_run_status "{\"groupId\":\"$1\",\"wait_for_end\":false}" 2>&1)
  st=$(echo "$out" | rg -o '"status": "[a-z_]+"' | head -1)
  echo "$(date +%T) ${st:-no answer}" >> "$2"
  if [ -n "$st" ] && ! echo "$out" | rg -q '"status": "(running|queued|pending)"'; then
    echo "$out" > "$2.final"
    echo RUN-ENDED >> "$2"
    echo PASS
    exit 0
  fi
  sleep 60
done
