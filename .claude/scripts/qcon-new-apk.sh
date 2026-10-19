#!/usr/bin/env bash
# 2026-10-19: publishing a new APK to QCon took many steps and the QCon install could not prove which build it had; this does it from dev01 with a hash check.
# Usage: qcon-new-apk.sh publish [apk]     build (or use [apk]), back up + replace the dev01 file, install by file name, hash check
#        qcon-new-apk.sh run <campaign> <tcId>...  start TCs on the env, print groupId + runIds, log them
#        qcon-new-apk.sh table <campaign>...       latest result per TC over the campaigns (markdown)
#        qcon-new-apk.sh list                      the TC ids of every suite (the final full run)
# Waiting for a run is not here: nohup .claude/scripts/qcon-poll-run.sh <groupId> <log> >/dev/null 2>&1 &
#   then ~/.claude/bin/wait-log <log> --done RUN-ENDED --max 590
# Env: QCON_ENV (default mkenv-pbx320011-02), QCON_APK_EXPECT (override the expected sha256; used to prove FAIL).
# Never installs by uploadId. Prints PASS or FAIL last.
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 1
ENV=${QCON_ENV:-mkenv-pbx320011-02}
NAME=brekeke_phone2.18.0.apk
REMOTE=/var/www/upload/$NAME
URL=https://dev01.brekeke.com/upload/$NAME
MCP=.claude/scripts/qcon-mcp.sh
IDS_LOG=$HOME/e2e-artifacts/brekeke-phone/qcon-run-ids.log
TMP=${TMPDIR:-/tmp}

SUITES=(
  TC-BRPHONE-E2ESIGNIN-001 TC-BRPHONE-E2ECALL-001 TC-BRPHONE-E2EBTN-001 TC-BRPHONE-E2EPN-001 TC-BRPHONE-E2EPNMA-001
  TC-BRPHONE-E2EWIFI-001 TC-BRPHONE-E2ECALL-002 TC-BRPHONE-E2EBTN-002 TC-BRPHONE-E2EPN-002 TC-BRPHONE-E2EWIFI-002
  TC-BRPHONE-E2EPNMA-002 TC-BRPHONE-SIGNIN-001 TC-BRPHONE-CALL-001 TC-BRPHONE-CALL-002 TC-BRPHONE-PUSH-001
  TC-BRPHONE-PUSH-002 TC-BRPHONE-UC-001
)

die() { echo "FAIL $*"; exit 1; }

# mcp <tool> <json>: prints the tool's JSON text (trailing PASS/FAIL line cut); returns its status
mcp() {
  local out rc
  out=$($MCP call "$1" "$2" 2>&1); rc=$?
  printf '%s\n' "$out" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(s.replace(/\n(PASS|FAIL)\s*$/,"\n")))'
  return $rc
}

cmd_run() {
  [ $# -ge 2 ] || die "usage: run <campaign> <tcId>..."
  local campaign=$1 ids out
  shift
  ids=$(printf '%s\n' "$@" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.stringify(s.trim().split("\n"))))')
  out=$(mcp qcon_run "{\"tcIds\":$ids,\"env\":\"$ENV\",\"campaign\":\"$campaign\",\"confirm_destructive\":true}") || { echo "$out"; die "qcon_run (check qcon_run_status {} before a retry: it may have started)"; }
  if echo "$out" | rg -q 'RUN_ALL_SKIPPED|"ok": false|"started": false'; then
    echo "$out" | head -20
    die "qcon_run refused"
  fi
  mkdir -p "$(dirname "$IDS_LOG")"
  {
    echo "$(date -u +%FT%TZ) campaign=$campaign env=$ENV tcs=$*"
    echo "$out" | rg -o '"(groupId|runId)": "[^"]+"' | sort -u
  } | tee -a "$IDS_LOG"
  echo PASS
}

cmd_list() { printf '%s\n' "${SUITES[@]}"; echo PASS; }

cmd_table() {
  [ $# -gt 0 ] || die "usage: table <campaign>..."
  local f c rc
  f=$(mktemp)
  for c in "$@"; do
    mcp qcon_run_results "{\"campaign\":\"$c\",\"tool\":\"phone_func\"}" > "$f.$c" || die "qcon_run_results $c"
  done
  node - "$f" "$@" <<'JS'
const fs = require('fs')
const [base, ...camps] = process.argv.slice(2)
const latest = new Map()
let records = 0
for (const c of camps) {
  const j = JSON.parse(fs.readFileSync(`${base}.${c}`, 'utf8'))
  for (const r of j.records || []) {
    records++
    for (const t of r.tests || []) {
      const m = /TC-[A-Z0-9]+-[A-Z0-9]+-\d+/.exec(t.name || '') || /test_([a-z0-9]+)_([a-z0-9]+)_(\d+)/i.exec(t.name || '')
      const id = !m ? t.name : m[0].startsWith('TC-') ? m[0] : `TC-${m[1]}-${m[2]}-${m[3]}`.toUpperCase()
      const key = `${r.date || ''} ${r.time || ''}`
      const old = latest.get(id)
      if (!old || key > old.key) latest.set(id, { key, outcome: t.outcome ?? t.result ?? '?', campaign: c })
    }
  }
}
if (!records) { console.log(`FAIL no records for: ${camps.join(' ')}`); process.exit(1) }
console.log('| TC | last run UTC | result | campaign |\n|---|---|---|---|')
for (const [id, v] of [...latest].sort()) console.log(`| ${id} | ${v.key.trim()} | ${v.outcome} | ${v.campaign} |`)
console.log('PASS')
JS
  rc=$?
  for c in "$@"; do rm -f "$f.$c"; done
  rm -f "$f"
  return $rc
}

cmd_publish() {
  local apk=${1:-} sha expect short out remote_sha campaign rid got
  if [ -z "$apk" ]; then
    out=$(~/.claude/bin/android-build 2>&1) || { echo "$out" | tail -5; die "android-build (run it bare, then: publish <apk path>)"; }
    apk=$(echo "$out" | sed -n 's/^ok: .*APK \(.*\.apk\).*/\1/p; s/^release APK is not new.*\(\/[^ ]*\.apk\).*/\1/p' | tail -1)
  fi
  [ -f "$apk" ] || die "no APK file: '$apk'"
  cp "$apk" "$TMP/$NAME" || die "copy to $TMP"
  sha=$(shasum -a 256 "$TMP/$NAME" | cut -d' ' -f1)
  expect=${QCON_APK_EXPECT:-$sha}
  short=$(git rev-parse --short HEAD)
  echo "local sha256    $sha  (app $short, $(stat -f %z "$TMP/$NAME") bytes)"

  ssh -o BatchMode=yes brekeke-dev01 'df -Pk ~ | tail -1' > "$TMP/df.txt" 2>&1 || die "ssh brekeke-dev01: $(head -3 "$TMP/df.txt")"
  [ "$(awk '{print $4}' "$TMP/df.txt")" -gt 1000000 ] || die "dev01 has less than 1 GB free"

  remote_sha=$(curl -sS "$URL" | shasum -a 256 | cut -d' ' -f1)
  if [ "$remote_sha" = "$sha" ]; then
    echo "dev01 file already is this build: no backup, no upload"
  else
    ssh brekeke-dev01 "mkdir -p ~/apk-backups && cp -n $REMOTE ~/apk-backups/$NAME.bak-$(date +%F)-before-$short && ls -l ~/apk-backups | tail -3" || die "backup on dev01"
    scp -q "$TMP/$NAME" "brekeke-dev01:$REMOTE" || die "scp (ssh brekeke-dev01 whoami; ls -ld /var/www/upload)"
  fi
  remote_sha=$(curl -sS "$URL" | shasum -a 256 | cut -d' ' -f1)
  echo "dev01 sha256    $remote_sha"
  [ "$remote_sha" = "$expect" ] || die "dev01 hash $remote_sha is not the expected $expect"

  out=$(mcp qcon_instance_emulator "{\"env\":\"$ENV\",\"action\":\"install\",\"file\":\"$NAME\"}") || { echo "$out" | head -10; die "install by file (409 EMULATOR_BUSY: wait for the run to end)"; }
  echo "install: $(echo "$out" | tr -d '\n ' | cut -c1-160)"

  campaign=dev-vu_e2e-apkhash-$(date +%Y%m%d%H%M)
  out=$(cmd_run "$campaign" TC-BRPHONE-E2EAPKHASH-001) || { echo "$out"; die "hash TC did not start"; }
  rid=$(echo "$out" | sed -n 's/.*"runId": "\([^"]*\)".*/\1/p' | head -1)
  [ -n "$rid" ] || { echo "$out"; die "no runId"; }
  got=''
  for _ in $(seq 1 60); do
    mcp qcon_run_status "{\"runId\":\"$rid\",\"tail\":400}" > "$TMP/hash-status.txt" 2>&1
    got=$(rg -o 'APK_SHA256=[0-9a-f]{64}' "$TMP/hash-status.txt" | head -1 | cut -d= -f2)
    [ -n "$got" ] && break
    rg -q '"status": "(failed|error|cancelled)"' "$TMP/hash-status.txt" && break
    sleep 15
  done
  [ -n "$got" ] || die "no APK_SHA256 from run $rid (see $TMP/hash-status.txt)"
  echo "emulator sha256 $got"
  [ "$got" = "$expect" ] || die "emulator has $got, expected $expect: QCon did not install this build"
  trash "$TMP/$NAME" "$TMP/hash-status.txt" "$TMP/df.txt"
  echo "PASS published ${sha:0:8}"
}

case "${1:-}" in
  publish) shift; cmd_publish "$@" ;;
  run) shift; cmd_run "$@" ;;
  table) shift; cmd_table "$@" ;;
  list) cmd_list ;;
  *) die "usage: publish [apk] | run <campaign> <tcId>... | table <campaign>... | list" ;;
esac
