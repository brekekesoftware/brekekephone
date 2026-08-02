<!-- START doctoc -->

- [Permissions and ringtone](#permissions-and-ringtone)
  - [Permissions and Google Play policy](#permissions-and-google-play-policy)
  - [Ringtone is a small subsystem with native and PBX parts, and reconciles more actively than it looks](#ringtone-is-a-small-subsystem-with-native-and-pbx-parts-and-reconciles-more-actively-than-it-looks)

<!-- END doctoc -->

# Permissions and ringtone

## Permissions and Google Play policy

**What looks a bit odd:** `permissions.ts` is a long matrix of near-identical functions by platform and API level: `checkPermForCallIos`/`checkPermForCallAndroid`, `permForCallIos`/`permForCallAndroid`, plus `permForCallLog`, `permNotifications`, `permDisableBatteryOptimization`, `permAndroidLpcForIncomingCall`, `permOverlayPermission`.

**Why it has to be this way:**

- Each flow needs a different set of permissions: call audio, call video, call log, notification, bluetooth.
- Android permissions change by version: `BLUETOOTH_CONNECT` is only checked from API 31 (`Platform.Version < 31 ? 'granted' : r[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT]`, in both the check and request functions) -- the manifest declares it unconditionally, which is fine since the OS itself ignores it pre-31. The call log permission is a sensitive group.
- iOS `requestNotifications()` reliably returns `'denied'` regardless of actual state, so `permForCallIos` has an explicit comment about this and calls `checkPermForCallIos(true, isNotifyPermNeeded)` (via `checkNotifications()`) as the real check instead of trusting the request result.

**Things to watch when changing this:**

- Requesting an additional permission is a release-time risk: the app has had to hotfix over Google Play permission policy before.
- Only request a permission right before the flow the user understands (starting a call, turning on video), not at app launch.
- Permission changes need retesting across multiple API levels, not just the newest device.

Related files:

- `brekekephone/app/src/utils/permissions.ts`
- `brekekephone/app/android/app/src/main/AndroidManifest.xml`
- `brekekephone/app/ios/BrekekePhone/Info.plist`
- `brekekephone/app/ios/BrekekeLPCExtension/Info.plist`

## Ringtone is a small subsystem with native and PBX parts, and reconciles more actively than it looks

**What looks a bit odd:** there is a static ringtone, a custom ringtone fetched from PBX (`pbxRingtone`), native validation, and a resync when the app comes to foreground -- and the resync does more than just re-check, it actively prunes stale ringtones and can reset the account's selection.

**Why it has to be this way:**

- The incoming call ringtone must play natively, since the RN UI may not be mounted yet. Native playback/validation is bridged via `BrekekeUtils.validateRingtone`/`getRingtoneOptions`, implemented in `BrekekeUtils.kt` (Android) and `BrekekeUtils.swift` (iOS).
- iOS's `RingtoneUtils.swift` validation was hardened (merged from `origin/feature/improve-x-ringtone-handling`, fix 1999 "X-Ringtone does not work with some URL on iOS"): `_audio(r:)` used to only check for a literal `.mp3` suffix, which missed URLs that carry the format in a query param or path segment instead (checked via `URLComponents` now); and a downloaded/cached ringtone file is now verified by actual content (`isMp3File`: an ID3 tag header or a raw MP3 sync word in the first bytes) rather than trusted by filename alone, with an invalid cached file deleted so it can't keep being served.
- A custom ringtone is a file from PBX, so it needs downloading, validation, and caching: `ringtone-picker.ts`'s `pickRingtone` enforces mp3-only and a 1MB cap; `saveToCache` uses `@react-native-documents/picker`'s `keepLocalCopy` (handling an `ALREADY_EXISTS` case with a replace prompt); `validateRingtone` falls back to `staticRingtones[0]` if the PBX-provided ringtone is invalid or blank.
- The ringtone choice is per-account and persisted together in `_api_profiles` (`saveRingtoneSelection` sets `ca.ringtone` and debounced-saves).
- **Confirmed more sophisticated than a simple resync:** `sync-ringtone-on-foreground.tsx`'s `SyncRingtoneOnForeground` listens for the `inactive|background` -> `active` transition and calls `handleRingtoneOptionsInSetting()` (`get-ringtone-options.ts`), which actively prunes stale custom ringtones from `ctx.account.ringtonePicker` and resets the account's ringtone selection back to default if the previously-selected option has disappeared. This is a real reconciliation step, not just a re-fetch.

**Things to watch when changing this:**

- Test incoming calls while the app is killed, since that is where ringtone bugs are most likely.
- A file that fails to download or is invalid must fall back to the default ringtone, not fail silently.
- Changing the ringtone for the active account must sync down to native, not just change JS state.
- If you touch the foreground resync, remember it can silently change the user's selected ringtone (reset to default) if the underlying option disappeared -- do not "simplify" this into a pure read-only refresh without checking what currently depends on the reset behavior.

Related files:

- `brekekephone/app/src/utils/ringtone-picker.ts`
- `brekekephone/app/src/utils/get-ringtone-options.ts`
- `brekekephone/app/src/utils/sync-ringtone-on-foreground.tsx`
- `brekekephone/app/src/utils/brekeke-utils.ts`
