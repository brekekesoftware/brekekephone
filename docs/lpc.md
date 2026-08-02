<!-- START doctoc -->

- [LPC subsystem](#lpc-subsystem)
  - [LPC is its own subsystem](#lpc-is-its-own-subsystem)

<!-- END doctoc -->

# LPC subsystem

## LPC is its own subsystem

The app has Local Push Connectivity over a TLS socket; iOS has `BrekekeLPCExtension`, Android has a foreground service (now split across several Kotlin files instead of one Java file), and config comes from PBX `webphone.lpc.*`.

LPC lets the PBX push calls/chat directly over TLS on the LAN, without going through APNs/FCM. Newer PBX supports `pnmanage` with multiple services, so the app can register LPC alongside APNs/FCM. The config `webphone.lpc.pn=true` means that when LPC is enabled, the app still registers normal push (`fcm`/`apns`) as a fallback, confirmed in `sync-pn-token.ts`: when `lpcPn` is true, the `service_id` array includes both `PnServiceId.lpc` and `fcm`/`apns`. `webphone.lpc.keyhash` is the SPKI SHA256 base64 hash used to pin the TLS cert. If a port is configured but the keyhash is missing, the app calls `BrekekeUtils.disableLPC()` to turn LPC off, with an explicit warning that non-TLS LPC connections are not allowed. On Android, the SPKI pinning is implemented natively in `LpcUtils.kt`'s `createTrustedSSLContext`, which extracts the leaf cert's SPKI, SHA-256+Base64-encodes it, and compares it inside a custom `X509TrustManager.checkServerTrusted`.

A few differences between iOS and Android are worth remembering. iOS LPC still depends on the SSID in the config (`pushManager.matchSSIDs = ...remoteSsids` in `BrekekeLPCManager.swift`), because `NEAppPushManager` needs to match the network. Android LPC does not depend on SSID, and this is not just "unimplemented", it is actively vestigial: a `localSsid` parameter is still threaded through the JS<->native call signature (`sync-pn-token.ts` -> `brekeke-utils.ts`), but it is hardcoded to an empty string and is not even passed through to the Android native intent. Do not assume changing that parameter has any effect on Android; if SSID-based gating is ever needed on Android, this plumbing needs real wiring, not just a non-empty value. iOS needs the `app-push-provider` entitlement, an app group, and Wi-Fi info/location/local network permission. Android needs a foreground service, notification permission, and boot receiver/network handling. The Android foreground service has explicit comments about Android 14+ (target SDK 35) timing requirements: `startForegroundService()` must be followed by `startForeground()` within 5 seconds.

One iOS quirk worth calling out on its own: `BrekekeLPCExtension` can be re-instantiated in the same process without `stop()` being called. iOS can spin up a new `NEAppPushProvider` in the same process (e.g. after the `nesessionmanager` extension host is killed under memory pressure and relaunched) without ever calling `stop()` on the old instance. The old instance's `BaseChannel` keeps its LPC connection alive, so the new provider opens a second connection using the same DeviceID, the PBX kicks one of them, and a no-backoff reconnect loop turns into a connection storm. The fix is a process-wide static `activeChannel` reference in `BrekekeLPCExtension.swift`: each new provider instance disconnects whatever channel the previous instance left running before wiring up its own, so there is never more than one live LPC connection per process. If you touch this file, do not remove that static reference thinking it is dead code; it is the entire fix for a real, previously-shipped connection-storm bug.

Verify both the app log and the PBX PN log when debugging LPC. The app having a socket heartbeat does not mean the PBX successfully routed the PN to the right account. Test the `webphone.lpc.pn=true` case specifically: the same `pn-id` can arrive from both LPC and FCM/APNs, and the parser/callStore must keep only one incoming call/action. Do not "fix" duplicate PNs by removing normal push from `service_id` unless the fallback requirement for when LPC cannot reach the device has been settled. Do not call `startForegroundService` again just to refresh config while the service is already running, since it can repost the notification. On iOS, `NEAppPushManager.loadAllFromPreferences` must be called early to set the delegate, to avoid missing a call at app launch because of LPC. Test on real devices with a real PBX/config; automated tests are close to useless here.

Related files:

- `brekekephone/app/src/api/sync-pn-token.ts`
- `brekekephone/app/src/utils/brekeke-utils.ts`
- `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/lpc/BrekekeLpcService.kt`
- `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/lpc/BrekekeLpcSocket.kt`
- `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/lpc/BrekekeLpcReceiver.kt`
- `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/lpc/LpcUtils.kt`
- `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/lpc/LpcModel.kt`
- `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/lpc/BrekekeLpcServiceIntent.kt`
- `brekekephone/app/ios/BrekekePhone/BrekekeLPCManager.swift`
- `brekekephone/app/ios/BrekekeLPCExtension/BrekekeLPCExtension.swift`
