### Push notification setup

<!-- START doctoc -->

- [Android](#android)
- [iOS](#ios)

<!-- END doctoc -->

If push notifications aren't arriving, check both sides: the app's own config, and the PBX admin push notification settings for the account.

#### Android

- Make sure `brekekephone/app/android/app/google-services.json` is present and up to date (see [Credentials and config](./credentials-and-config.md)).
- Make sure the Firebase config configured in the PBX admin push notification settings matches the same Firebase project as that `google-services.json`.

#### iOS

- Make sure push notifications are configured correctly in the Xcode project (`General` capabilities, `Info.plist`, `BrekekePhone.entitlements`).
- Make sure the APNs config in the PBX admin push notification settings matches the app's bundle id/certificate.

For how the app actually handles a push once it arrives (cold start, background, LPC, dedupe, `callkeepUuid`), see [Push notifications](./push-notifications.md) and [LPC subsystem](./lpc.md) for those.
