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

## iPhone: a killed app is not woken by a call from the web phone (seen 2026-10-02)

- Where seen: real iPhone 13 mini, app 2.18.00 built with development signing, signed in as 102. `e2e/test-ios-pn.mjs` kills the app, the web phone (100) calls 102 (offline users shown). Run: `~/e2e-artifacts/brekeke-phone/ios-pn-first/`.
- Evidence: for 15 s the iPhone stays on the home screen (screenshot), no CallKit banner or slider; the web phone keeps ringing. With the app open the same call rings and connects (test `ios-call-in-out`, 11 of 11 passed).
- Update (user, same day): push calls work by hand when the app is in the foreground or background (CallKit banner on top). A force-quit app is not woken, as the user knows it. So this may be iOS behaviour, not a fault. The code path is PushKit (`PKPushRegistry`, `AppDelegate.swift:103`) then CallKit (react-native-callkeep `reportNewIncomingCall`). Apple's design (iOS 13+) says a VoIP push relaunches a terminated app; a swiped-away app is the unclear case. Not proven for XCUITest `terminateApp`.
- Effect: `test-ios-pn` now sends the app to the background (works: 10 of 10 pass). The kill variant is `E2E_IOS_KILL=1` and is expected to fail until someone proves what iOS does.
- Fix: none needed for the background case. To settle the killed case: one manual swipe-away test and the PBX push log.
