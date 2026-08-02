### Custom ringtone

<!-- START doctoc -->

- [Android](#android)
- [iOS](#ios)
- [Web browser](#web-browser)

<!-- END doctoc -->

#### Android

- When an incoming call comes, it tries each of the below with priority (`Ringtone.get()` in `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev/utils/Ringtone.kt`):
  - PN data `ringtone` (checked as `x_ringtone` first, then plain `ringtone` -- see `PN.kt`'s `get()` helper, which prefixes every PN field with `x_` before falling back to the bare key), same for LPC
  - PN off, then SIP `getHeader('X-Ringtone')` (`ringtoneFromSip` in `src/api/sip.ts`/`src/stores/call.ts`)
  - User-selected ringtone in account settings (`account.ringtone`)
  - PBX `getProductInfo` `webphone.call.ringtone` (synced into `account.pbxRingtone`)
  - Default (`incallmanager_ringtone`)
- For the list of available ringtones to select in account settings (`Ringtone.options()`), it comes from:
  - Pre-defined audio files bundled with the app
  - Ringtones from the system OS (`RingtoneManager`)
  - A locally picked mp3 file (`ringtone-picker.ts`'s `pickRingtone`, mp3-only, 1MB cap)
- For the server-provided values (`x_ringtone`/`ringtone`, `X-Ringtone`, `webphone.call.ringtone`), the value can be:
  - The name of one of the available ringtones above
  - A `https://` URL
- An `https://` URL is downloaded and played asynchronously; if it is not a valid/reachable audio file, there can be a brief silent delay before the next priority is tried and played instead.

#### iOS

- There is no official Apple API to play a fully dynamic custom ringtone per call; CallKit's `reportNewIncomingCall` only accepts a bundled sound name via `CXProviderConfiguration`. The app works around this by resolving the ringtone value (same PN/SIP-header/account/PBX priority as Android, in `RingtoneUtils.swift`) before calling `reportNewIncomingCall`, which is not an officially documented pattern and could stop working after an Apple API/policy change. Prefer pre-defined ringtones bundled with the app release where possible.
- Logic is otherwise the same as Android except:
  - No ringtone list from the system OS.
  - A `https://` URL is downloaded and cached to local storage before playing (see [Permissions and ringtone](./permissions-and-ringtone.md) for the mp3-content validation added on top of this download/cache step), which can also cause a brief silent delay before falling back to the next priority.

#### Web browser

- Logic is otherwise the same as Android except:
  - No ringtone list from the system OS.
  - No local mp3 file picker.
  - No PN data (the web build has no native push notification channel).
