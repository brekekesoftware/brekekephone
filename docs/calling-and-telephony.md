<!-- START doctoc -->

- [Calling and telephony](#calling-and-telephony)
  - [CallKeep, CallKit, and the Android native incoming UI now embeds real RN code](#callkeep-callkit-and-the-android-native-incoming-ui-now-embeds-real-rn-code)
  - [Android foreground service, target SDK, and background mic/camera](#android-foreground-service-target-sdk-and-background-miccamera)
  - [Android default dialer prompt](#android-default-dialer-prompt)
  - [Call line and the `X-PBX-RPI` header](#call-line-and-the-x-pbx-rpi-header)
  - [DTMF: early-media SIP INFO and RTCDTMFSender selection (both merged from stray branches)](#dtmf-early-media-sip-info-and-rtcdtmfsender-selection-both-merged-from-stray-branches)
  - [Auto-answer and 3PCC (`x_autoanswer` PN field vs SIP `Call-Info: answer-after=0`)](#auto-answer-and-3pcc-x_autoanswer-pn-field-vs-sip-call-info-answer-after0)
  - [Call actions are PBX round-trips with rollback (narrower scope than it looks)](#call-actions-are-pbx-round-trips-with-rollback-narrower-scope-than-it-looks)
  - [Recents, missed call notification, and the Android call log (call log write is currently OFF)](#recents-missed-call-notification-and-the-android-call-log-call-log-write-is-currently-off)

<!-- END doctoc -->

# Calling and telephony

## CallKeep, CallKit, and the Android native incoming UI now embeds real RN code

iOS still uses CallKit through RNCallKeep; Android still uses a self-managed ConnectionService and its own native `IncomingCallActivity` (now Kotlin, was Java). But that Android activity no longer hand-implements the in-call screen. Once a call is answered, it mounts a Fabric `ReactSurface` (registered as the `"IncomingCall"` component in `src/index.native.tsx`) into a container view and renders the real `PageCallManage` component (via `IncomingCallRoot`/`IncomingCallSurface` in `src/components/incoming-call-root.tsx`), sharing the same JS runtime and MobX stores as the main app.

When the app is locked/killed/backgrounded, the RN UI may not be mounted yet. The OS still needs a surface for the user to answer/reject, so the native Activity still owns the ringing screen (native XML views: answer/reject buttons, caller name, avatar). Duplicating the in-call screen (hold/mute/transfer/video/etc.) in native code was a real maintenance burden before 3.0.0: native code is not declarative like React, so every call-management feature had to be built twice. As part of 3.0.0, the Android incoming-call activity was changed to reuse the actual RN call screen instead of a second native implementation, and this is only possible because New Architecture/Fabric is now enabled (see [Architecture and startup](./architecture-and-startup.md)).

The RN surface is pre-warmed hidden while ringing so it is ready the instant the user answers. `IncomingCallSurface` finds its `Call` by `callkeepUuid` first, falling back to `pnId` (since `callkeepUuid` assignment can be late or fail on some PN parse edge cases), and closes the Activity directly when the call leaves the store rather than depending on `endCallKeep` timing. The overlay hosts (`ToastRoot`, `RnPickerRoot`, `RnAlertRoot`) are mounted inside this surface too, because the view tree is separate from the main app root even though the JS runtime/stores are shared. The nav stack (`RnStackerRoot`) intentionally stays only in the main root; navigation from inside the incoming-call surface goes through `PageCallManage.navOnMain` -> `BrekekeUtils.openMainActivity` instead. iOS CallKit still manages the audio session, routing, and lock screen actions; JS syncs with CallKit events (`didActivateAudioSession`/`didDeactivateAudioSession`) via `utils/callkeep.ts`, which calls into a unified native `setAudioActive(_:action:)` on `AudioSessionManager.swift` (the old separate `didActivateAudioSession`/`didDeactivateAudioSession` native methods were consolidated into this one entry point).

`callkeepUuid` is the key that links native actions to the `Call` model (`stores/call.ts`); `pnId` is the fallback key when `callkeepUuid` has not been associated yet. Android still has two surfaces, but they are no longer independently maintained UIs: the native ringing screen (XML) hands off to the same RN `PageCallManage` used everywhere else once answered. If you change `PageCallManage`, you are changing both the main in-call screen and the answered-from-lock-screen/killed-app screen at once, so test both entry points, not just the main app. Do not toggle WebRTC audio without going through the native `setAudioActive` path; iOS audio session state must stay in sync with what CallKit reports. Test answer/reject in quick succession, caller cancels quickly, auto-answer, lock screen, and killed app, specifically including the case where the SIP call event lands after the answer tap (app-killed case), which the incoming-call surface explicitly handles by showing a "Connecting..." indicator until the `Call` appears in the store.

Related files:

- `brekekephone/app/src/utils/callkeep.ts`
- `brekekephone/app/src/stores/call-store.ts`
- `brekekephone/app/src/stores/call.ts`
- `brekekephone/app/src/components/incoming-call-root.tsx`
- `brekekephone/app/src/index.native.tsx`
- `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/activity/IncomingCallActivity.kt`
- `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/BrekekeUtils.kt`
- `brekekephone/app/android/app/src/main/res/layout/incoming_call_activity.xml`
- `brekekephone/app/ios/BrekekePhone/AudioSessionManager.swift`
- `brekekephone/app/ios/BrekekePhone/AppDelegate.swift`

## Android foreground service, target SDK, and background mic/camera

Target SDK is 35 (min SDK 27), the CallKeep patch is large, and foreground service config lives in the patch/native layer. The patch file itself is now named `patches/react-native-callkeep.patch` (pnpm's native patching dropped the old `+4.3.16` version suffix from the filename; the version is still pinned exactly in `package.json`).

Android 14+ tightens microphone/camera/background service permissions heavily. If the FGS type is wrong, the call still connects but the mic can die once the app goes to background. If `camera` is declared in the manifest but `startForeground` is called with the 2-arg form, an audio-only call can crash because the runtime demands the CAMERA permission. Upstream `react-native-callkeep` is not enough for the app's cases, so the patch is close to a small fork: it is 1573 lines across 8 files (`Constants.java`, `RNCallKeepModule.java`, `VoiceConnection.java`, `VoiceConnectionService.java`, `index.d.ts`, `index.js`, `RNCallKeep.h`, `RNCallKeep.m`).

Bumping `targetSdk`/`compileSdk` requires retesting background call, lock screen, killed app, audio-only, and video call. Do not upgrade `react-native-callkeep` unless the patch is ported first. The Google Play declaration for microphone/camera/phoneCall/specialUse is a real release step, not just code. The CallKeep patch needs a native rebuild; it cannot be picked up with a JS reload.

Related files:

- `brekekephone/app/android/build.gradle`
- `brekekephone/app/android/app/build.gradle`
- `brekekephone/app/android/app/src/main/AndroidManifest.xml`
- `patches/react-native-callkeep.patch`

## Android default dialer prompt

On Android, `PushNotification.register()` (`push-notification.android.ts`) calls `BrekekeUtils.permDefaultDialer()` before requesting notification permissions, which triggers `BrekekeUtils.checkDefaultDialer()` on the native side. This prompts the user to set the app as the OS default phone/dialer app (via `TelecomManager.ACTION_CHANGE_DEFAULT_DIALER` pre-Android 10, or `RoleManager.ROLE_DIALER` on Android 10+). iOS has no equivalent concept, so this is Android-only.

The prompt is skipped outright if the app is already the default dialer, if the Android version doesn't support the API, or if there is an active call or a visible incoming-call Activity (`BrekekeUtils.kt`'s `checkDefaultDialer`/`onFcmMessageReceived`, guarded with an explicit `BUG-1203` comment: the popup must not interrupt incoming-call UX). The result is only resolved once per app run (`dialerCheckState`), not re-prompted on every launch.

This is why an incoming call can arrive and be answered correctly even if the user has never seen or dismissed the default-dialer prompt: the two flows are intentionally decoupled, and the prompt is considered lower priority than not disrupting a call.

Related files:

- `brekekephone/app/src/utils/push-notification.android.ts`
- `brekekephone/app/src/utils/brekeke-utils.ts`
- `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/BrekekeUtils.kt`
- `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/MainActivity.kt`

## Call line and the `X-PBX-RPI` header

Before placing an outgoing call, the app may show a line picker, then attach the `X-PBX-RPI` SIP header. PBX resource lines are parsed from `webphone.resource-line`. The `webphone.resource-line.pattern` pattern decides whether the number being dialed needs a line selection. The line is sent via `X-PBX-RPI`, then stored and shown again in recents (redial from `page-call-recents.tsx` reattaches `extraHeaders: ['X-PBX-RPI: ...']`).

If the caller already passes valid `extraHeaders` containing `X-PBX-RPI`, the app no longer shows the picker. An empty resource line value means "no line", not an error. If the regex pattern is invalid, the app logs a warning but still applies line selection. Redialing from recents should keep the old line if it still exists in the current config.

Related files:

- `brekekephone/app/src/stores/call-store.ts`
- `brekekephone/app/src/utils/resource-line.ts`
- `brekekephone/app/src/stores/add-call-history.ts`

## DTMF: early-media SIP INFO and RTCDTMFSender selection (both merged from stray branches)

`webrtcclient.js`'s `sendDTMF` has a `sendSipInfoDTMF` wrapper for the SIP-INFO/inband send modes, and a separate `dtmfSendMode === 2` branch that searches `getSenders()` for one with `canInsertDTMF` instead of just using `getSenders()[0]`.

JsSIP's `RTCSession.sendDTMF()` only sends once the session is `STATUS_CONFIRMED` (9) or `STATUS_WAITING_FOR_ACK` (6); calling it during early media (`STATUS_1XX_RECEIVED` = 2, before 200 OK) is a silent no-op in JsSIP itself (verified against `node_modules/jssip/lib/RTCSession.js`: `sendDTMF()` checks exactly these two statuses and returns early otherwise). `sendSipInfoDTMF` (merged from the `origin/dtmf` branch, commit `c40b9dac1`, "Try fix dtmf early media") works around this by sending a SIP INFO request directly through `rtcSession._earlyDialogs` while still in early media, falling back to the normal `rtcSession.sendDTMF()` once confirmed, or if no early dialog is found. `_earlyDialogs` and `Dialog.sendRequest()` are real, populated JsSIP internals (not a guess), confirmed against the vendored `jssip@3.2.15` package.

Separately, the `dtmfSendMode === 2` path (native `RTCDTMFSender.insertDTMF`, used on some platforms/configs instead of the inband/SIP-INFO modes) used to grab `session.rtcSession.connection.getSenders()[0]` unconditionally. If the first sender happened to be a non-audio (e.g. video) track without DTMF capability, `insertDTMF` would fail. The merged fix (from `origin/embed`, despite the branch's unrelated name) instead finds the first sender whose `dtmf.canInsertDTMF` is true, and throws a clear error if none qualifies (caught and logged, not left to fail obscurely). Note: the merge itself introduced a copy-paste bug in this same call, where the `interToneGap` argument was checking `options.duration !== 'undefined'` instead of `options.interToneGap !== 'undefined'`, so a caller supplying only `interToneGap` would have it silently dropped. This has been fixed; if you touch this call again, double check both arguments guard their own option, not the same one twice.

These two fixes came from separate stray branches that had each independently diverged from `master` months apart, but touch different, non-overlapping sections of the same function, so merging both together did not conflict.

`sendSipInfoDTMF` was explicitly an experimental fix ("Try fix..." commit message). It is logically sound against the vendored JsSIP internals (verified), but treat it as needing real-device/real-PBX telephony testing (early media with a provider that actually plays DTMF tones from SIP INFO) before relying on it in a release, same as any other change in this file. This is vendored SDK code, not a normal TypeScript wrapper. Operator Console uses its own `webphone.js` bundle; a fix in Brekeke Phone does not reach OC automatically unless that bundle is rebuilt/shipped. "No local beep when pressing DTMF" is a UX feedback issue, separate from whether DTMF is actually sent.

Related files:

- `brekekephone/app/src/brekekejs/webrtcclient.js`
- `brekekephone/app/src/api/sip.ts`

## Auto-answer and 3PCC (`x_autoanswer` PN field vs SIP `Call-Info: answer-after=0`)

There are two independent auto-answer mechanisms in this app, triggered by different sources, and they are easy to conflate because both end up setting the same `Call.isAutoAnswer` flag.

The first is PN-driven: `push-notification-parse.ts` normalizes both `autoanswer` and `x_autoanswer` PN payload keys into one `autoanswer` field, converts it to a boolean, and stores it as `sipPn.autoAnswer` on the parsed PN. Android handles this entirely natively: `IncomingCallActivity.kt` reads `PN.autoAnswer(data)` and, if true, calls `handleClickAnswerCall()` directly and suppresses the ringtone, with no JS round-trip needed. iOS has no native auto-answer code at all (it was removed once because Apple's privacy policy did not allow it, per the `2.15.1` changelog entry); instead `call-store.ts`'s `onCallKeepDidDisplayIncomingCall` sets `Call.isAutoAnswer = true` and defers `RNCallKeep.answerIncomingCall(...)` by 2000ms via `BackgroundTimer`, and `callkeep.ts` has an iOS-only ordering guard so the audio session is not assigned to WebRTC before CallKit's `didActivateAudioSession` fires. `upsertCall` in `call-store.ts` only applies `isAutoAnswer` when there is no other ongoing call with a different `callkeepUuid`, so auto-answer never fires while the user already has another call in progress.

The second is SIP/CTI-driven, used for 3PCC paging: `sip.ts`'s `computeCallPatch` checks the incoming INVITE's `Call-Info` header for `answer-after=0` and sets `isAutoAnswer` from that instead of the PN. This path also passes a fixed `ctiAutoAnswer: 1` option into the vendored `webrtcclient.js` SDK, which performs its own SDK-level answer internally when it sees the same `Call-Info` pattern, independent of the PN-driven path above.

Both iOS and Android have had real regressions in this area (see `2.17.3`'s 3PCC paging regression and the CallKit-UI fix in `2.17.5`), so treat this as a genuinely fragile area, not a simple boolean flag.

Do not assume `autoAnswer` only comes from a PN; check whether a given bug is PN-driven or Call-Info/CTI-driven before fixing it, since they are separate code paths that happen to set the same field. Test auto-answer specifically with: another call already in progress (should not auto-answer), app foreground/background/killed, and, if you have a PBX/provider that supports 3PCC paging, the `Call-Info: answer-after=0` path separately from the PN path.

Related files:

- `brekekephone/app/src/utils/push-notification-parse.ts`
- `brekekephone/app/src/stores/call.ts`
- `brekekephone/app/src/stores/call-store.ts`
- `brekekephone/app/src/utils/callkeep.ts`
- `brekekephone/app/src/api/sip.ts`
- `brekekephone/app/src/brekekejs/webrtcclient.js`
- `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/utils/PN.kt`
- `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/activity/IncomingCallActivity.kt`

## Call actions are PBX round-trips with rollback (narrower scope than it looks)

`stores/call.ts` (the per-call model, split out of `call-store.ts`) has `rqLoadings` and per-action `onXxxFailure` functions to revert state. PBX/SIP is the source of truth: the UI updates optimistically for smoothness, but must revert if the server reports an error. CallKit/ConnectionService can also trigger actions (hold/mute from the lock screen), so state must sync both ways between native and JS. Video is not just one local and one remote stream either: there is a video session table for conference/screen share, per-remote-user options, and the currently active stream.

`rqLoadings` currently only tracks `{ hold: false, record: false }`, not every action. `onTransferFailure`, `onStopTransferringFailure`, `onConferenceTransferringFailure`, and `onParkFailure` all exist and revert state on failure, but they are not gated through `rqLoadings`, and there is no dedicated mute-failure handler at all. Do not assume every action has the same double-tap protection as hold/record; check the specific action before relying on it. Do not set state directly and skip `rqLoadings` for hold/record; it blocks double taps while a request is in flight. Do not drop a failure branch to make the code shorter; the UI would then show the wrong state compared to PBX. Test hold/mute from both the app UI and native, attended and blind transfer, park/pickup, camera switch, and calls with multiple video streams.

Related files:

- `brekekephone/app/src/stores/call.ts`
- `brekekephone/app/src/stores/call-store.ts`
- `brekekephone/app/src/pages/page-call-manage.tsx`

## Recents, missed call notification, and the Android call log (call log write is currently OFF)

`addCallHistory` still does dedupe, skips certain cases, presents a notification, and saves recents all in one function, but the branch that writes to the Android system call log is currently short-circuited to a no-op.

The same call can arrive through multiple paths (SIP event, PN, CallKit), so it must be deduped by `pn-id`. Some cases are not recorded: voicemail (`partyNumber === '8'`), and a call canceled with a `Reason` header matching `/call completed elsewhere/i` (another device already answered). A missed call needs a notification because the user does not see the app UI, but if the user rejected it themselves, it should not notify.

`addToCallLog()` in `add-call-history.ts` currently starts with `const disabled = true; if (disabled) { return }`, marked with a `// TODO: temporary disabled` comment. `BrekekeUtils.insertCallLog(...)` is still called from `addCallHistory` on Android, but it is dead code right now because of this flag. If you are debugging "missing entries in the Android system call log", this is why: it is not a bug, it is an intentionally (if temporarily) disabled feature. Check whether this flag is still `true` before assuming the feature works or is broken.

All three outputs (recents, notification, Android call log) live in the same function. Changing one branch means checking all three, including whether the call-log branch is still disabled. `created` is stored as an already-formatted string (`moment().format('HH:mm - MMM D')`). Its format or locale cannot change after the fact; if sorting or relative time is needed later, add a new timestamp field instead of reparsing the string. Changing the dedupe logic can easily create duplicate missed-call notifications or lose a record if the app is killed mid-flow. Re-enabling the Android call log write requires re-verifying the separate, Google-Play-scrutinized call log permission still works as expected on current target SDK.

Related files:

- `brekekephone/app/src/stores/add-call-history.ts`
- `brekekephone/app/src/stores/auth-store.ts`
- `brekekephone/app/src/pages/page-call-recents.tsx`
