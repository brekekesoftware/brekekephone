<!-- START doctoc -->

- [Push notifications](#push-notifications)
  - [App init lives inside PushNotification.register](#app-init-lives-inside-pushnotificationregister)
  - [PN dedupe and `callkeepUuid`](#pn-dedupe-and-callkeepuuid)

<!-- END doctoc -->

# Push notifications

## App init lives inside PushNotification.register

`brekekephone/app/src/app.tsx` (the root component and `initApp`, which now live directly under `src/`, not under `src/components/`) calls `PushNotification.register(async () => { ...; await initApp() })`, guarded by a module-level `alreadyInitApp` flag, while each platform file may also call `initApp()` from its own PN handlers.

A PN can arrive during cold-start, background, killed state, or before the RN UI is ready. iOS has APNs, PushKit/VoIP, the initial notification, and local notifications. Android has FCM foreground/background/opened/initial notification, and caches native initial notifications. `alreadyInitApp` is a guard so these callbacks do not init the app more than once.

Do not move app init into a plain `useEffect` unless you have replaced all the PN cold-start paths. Inside the PN handler, `await initApp()` before parsing is intentional, confirmed still true in both `push-notification.ios.ts`'s `onNotification` and `push-notification.android.ts`'s `onNotification`: parsing may need `ctx`, the account, nav, or callkeep. The race between auto-login and `signInByNotification` is very sensitive, so do not remove the `isSigningInByNotification` guard (checked before and after an `await` in `app.tsx`'s `autoLogin`, and again in `auth-sip.ts`).

Related files:

- `brekekephone/app/src/app.tsx`
- `brekekephone/app/src/utils/push-notification.ios.ts`
- `brekekephone/app/src/utils/push-notification.android.ts`
- `brekekephone/app/src/utils/push-notification-parse.ts`

## PN dedupe and `callkeepUuid`

`push-notification-parse.ts` parses a lot of payload shapes, supports `x_*` keys, keeps several separate dedupe maps, and has to link `pn-id` with `callkeepUuid`. The call model itself is split into a `call-store.ts` (orchestration) and a separate `call.ts` (per-call `Call` class holding `callkeepUuid`/`pnId`, among other fields).

FCM/APNs/LPC/local notifications each return a different payload shape. When both LPC and normal push are enabled, the same incoming call can arrive as two PNs: one from LPC, one from FCM/APNs. Android can replay the initial notification or fire the opened event more than once (dedupe maps `androidAlreadyProccessedPn` and `androidProcessedLocalChatNotification` guard against this). `pn-id` is the call key from PBX, while CallKeep/ConnectionService uses `callkeepUuid` to map answer/reject/mute/hold actions back to the right call in JS.

Getting `callkeepUuid` through the PN payload needs help outside plain app code, and `push-notification-parse.ts` has inline comments describing this as a "custom fork of react-native-voip-push-notification to get callkeepUuid" and "we forked fcm to insert callkeepUuid there as well." Correction: neither is a git fork of a third-party package. `react-native-voip-push-notification` is a normal npm dependency (`3.3.3`), and its `callkeepUuid` injection is implemented as a regular pnpm patch (`patches/react-native-voip-push-notification.patch`, adding a `callkeepUuid:` param to `didReceiveIncomingPushWithPayload:forType:`), so `patches/` is the right place to look for that half. There is no dependency named "fcm" in `package.json` at all; the "we forked fcm" half is plain custom app code, a custom `FirebaseMessagingService` in `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/BrekekeUtils.kt`, not a patched or forked third-party package. If you're auditing where `callkeepUuid` injection lives, check `patches/react-native-voip-push-notification.patch` and `BrekekeUtils.kt`, not a phantom forked git dependency.

Do not change the payload parser unless you have real sample payloads for Android/iOS/FCM/LPC/local notification. Do not remove the dedupe maps; they prevent double answer/reject, duplicate local chat notifications, and stale PNs. Do not treat duplicate LPC + FCM/APNs as a simple bug and delete the anti-duplicate logic: deduping by `pn-id` and bridging `pn-id`/`callkeepUuid` is what keeps the app from showing two incoming call UIs for the same call. If a call has a `pn-id` but is missing `callkeepUuid`, the incoming UI may still show up but answer/reject actions may not map back to the SIP session; `call.ts` has a documented fallback where `pnId` is used to re-associate a call when `callkeepUuid` assignment fails or arrives late (see the incoming-call surface's lookup logic in [Calling and telephony](./calling-and-telephony.md)).

`resetProcessedPn()` is risky and has an explicit inline comment explaining why: after a PBX server reset, call ids (plain numbers) restart from 1, 2, 3... so a stale cache of "already processed" ids can cause new calls to be wrongly rejected as duplicates. Called from `api/index.ts` and `api/sip.ts` (with a nearby comment in `auth-sip.ts` noting a redundant double-call to `sip.connect` here). `stores/cancel-recent-pn.ts` is a newer, separate file tied into this same dedupe/cancel flow; check it alongside `call-store.ts`/`push-notification-parse.ts` when touching PN cancel handling. `push-notification-parse.ts` also calls `ctx.auth.queueIncomingCustomPageEvent(...)` at two points (a live call PN, and a killed-app cold-start tap on a missed-call notification) to feed the custom-page incoming/open event queue, see [Custom page](./custom-page.md). If you change how a PN is classified as a call vs. a missed-call notification here, check whether that queuing still fires correctly.

Related files:

- `brekekephone/app/src/utils/push-notification-parse.ts`
- `brekekephone/app/src/utils/callkeep.ts`
- `brekekephone/app/src/stores/call-store.ts`
- `brekekephone/app/src/stores/call.ts`
- `brekekephone/app/src/stores/cancel-recent-pn.ts`
