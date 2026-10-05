#!/usr/bin/env bash
# 2026-10-06: RN 0.84 Hermes V1 is spec-strict: `new obj.init()` on a shorthand method `init() {}`
# throws "Function is not a constructor", so UC sign-in (CryptoJS.MD5 in ucclient.js) failed.
# Runs the bundled CryptoJS in Node (also spec-strict) and checks MD5("abc"). Prints PASS or FAIL.
cd "$(dirname "$0")/../.." || exit 2
f=src/brekekejs/ucclient.js
start=$(rg -n '^var CryptoJS = \(function' $f | cut -d: -f1)
end=$(awk -v s="$start" 'NR>s && /^\}\)\(\)/ {print NR; exit}' $f)
out=$(sed -n "${start},${end}p" $f | node -e '
let src = require("fs").readFileSync(0, "utf8")
try { const C = new Function(src + "; return CryptoJS")(); console.log(C.MD5("abc").toString()) }
catch (e) { console.log("error: " + e.message) }')
if [ "$out" = 900150983cd24fb0d6963f7d28e17f72 ]; then echo "PASS cryptojs md5"; else echo "FAIL cryptojs md5: $out"; exit 1; fi
