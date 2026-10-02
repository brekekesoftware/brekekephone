# Known issues

## e2e `test-pn` case A2 fails: "web call timer" not shown (seen 2026-10-02)

- Where seen: `test-pn`, case A2, step "the web phone does not hang up by itself (the server sends the call to voicemail)". Timeout 15000 ms waiting for "web call timer". Run folder: `~/e2e-artifacts/brekeke-phone/pn-2026-10-02T09-49-05-lpc-off/`.
- Evidence: failed the same way in two runs on the build with the boot-line commit 26c3ae8c. The web screenshot (`A2-FAIL-8-web.png`) shows the call screen for 102 with no timer.
- Not proven: if it also fails on commit 4b239103 (before the boot line). The only app change is one log line, and the web app is unchanged, so it is most likely the PBX voicemail timing or the web check, not the app.
- Fix: run case A2 on the build of 4b239103 once. If it fails there too, the check or the PBX needs a fix. Treat as red before any upgrade.
- Same for other tests red before any upgrade (2026-10-02): `test-pn` B1 (web chat input), `test-call-buttons` D1, `test-pn-multi-account` steps 3, 4, 9, 10.

## iOS simulator: app closes ("Unexpected error occured") after sign-in (seen 2026-10-02)

- Where seen: Release build 2.18.00 on iPhone 17 Pro simulator (iOS 26.5), a few seconds after SIGN IN, status "Connecting to SIP...".
- Evidence: simulator log: `NSInvalidArgumentException ... attempt to insert nil object`, top app frame `-[WebRTCModule(RTCMediaStream) enumerateDevices:]` (react-native-webrtc).
- Not proven: that it is the missing camera on the simulator (very likely: no device id to put in the list). Not proven if it also happens with the new react-native-webrtc version.
- Effect: the simulator cannot run call tests. Plan P14 fallback: run the iOS call tests on the real iPhone too.
