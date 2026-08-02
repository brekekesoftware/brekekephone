### Building and deploying to dev01

<!-- START doctoc -->

- [What dev01 is for](#what-dev01-is-for)
- [iOS: provisioning profile requirements](#ios-provisioning-profile-requirements)
- [Android: keystore](#android-keystore)
- [Build and upload](#build-and-upload)

<!-- END doctoc -->

#### What dev01 is for

`dev01.brekeke.com` hosts ad-hoc/internal builds for testing -- it is separate from the App Store/Play Store (see [Building for the App Store and Play Store](./app-store-release.md) for that). See [Repo layout](./repo-layout.md#dev01) for what each piece of `dev01/` does, and [Makefile reference](./makefile-reference.md) for exactly what each `make` target runs.

You can build and upload either bundle from either branch:

- `com.brekeke.phonedev` ("Brekeke Phone Dev") from `master` -- `make phonedev`
- `com.brekeke.phone` ("Brekeke Phone") from `release` -- `make phone`

See [Branching strategy](./branching-strategy.md) for why both exist.

#### iOS: provisioning profile requirements

Unlike Android (a single keystore file), iOS needs a correctly configured App ID and provisioning profile in the Apple Developer portal _before_ you can build and sign an IPA at all. This app's App ID needs every one of the following configured correctly, matching what's declared in `brekekephone/app/ios/BrekekePhone/BrekekePhone.entitlements` and `Info.plist`:

- Push Notifications capability (APNs): `aps-environment` entitlement, `remote-notification` background mode.
- VoIP: `voip` background mode (PushKit), so an incoming call can wake the app.
- Network Extensions, `app-push-provider`: required for LPC (see [LPC subsystem](./lpc.md)). This is what lets `BrekekeLPCExtension` (a separate `NEAppPushProvider` app extension target) run.
- App Groups: `group.com.brekeke.lpcdev`, shared between the main app target and the LPC extension target so they can communicate.
- Associated/iCloud containers: `iCloud.$(CFBundleIdentifier)` and the `CloudDocuments` service.
- Wi-Fi Information: `com.apple.developer.networking.wifi-info`, used by LPC's SSID matching on iOS (see [LPC subsystem](./lpc.md)).
- Keychain sharing: `$(AppIdentifierPrefix)com.brekeke.phonedev` (or the equivalent for `com.brekeke.phone` on the `release` branch).

The LPC extension target (`BrekekeLPCExtension`) needs its own provisioning profile too, with the matching `app-push-provider` + App Group entitlements (see `brekekephone/app/ios/BrekekeLPCExtension/BrekekeLPCExtension.entitlements`).

If you are a new developer setting this up, getting all of the above right from scratch (especially the LPC Network Extension entitlement, which Apple has to specifically grant for your team) is slow and easy to get subtly wrong. Prefer reusing an existing, already-working provisioning profile/certificate from another developer on the team who already has this configured, rather than requesting and configuring a new one from zero, unless you specifically need your own.

Once the provisioning profile is correct, build normally in Xcode: Archive, then Export (Ad-hoc or Enterprise, matching whatever the provisioning profile allows) to `./build/BrekekePhone/<scheme name>.ipa` at the repo root -- this exact path is what `make phonedev`/`make phone` expect (see [Makefile reference](./makefile-reference.md)).

#### Android: keystore

The release signing config (`brekekephone/app/android/app/build.gradle`) points at `brekekephone/app/android/keystores/release.keystore` with a fixed alias/password already committed in `build.gradle` -- the only secret you actually need is the keystore file itself, which is gitignored (see [Credentials and config](./credentials-and-config.md)). Get this file from whoever manages it for this product; do not generate a new one unless you are deliberately starting a new, separate app identity (a new keystore cannot sign updates for an app already published under the old one).

Once the keystore file is in place, `make phonedev`/`make phone` build the APK themselves (`./gradlew clean && ./gradlew generateCodegenArtifactsFromSchema && ./gradlew assembleRelease`) -- you don't need to build the APK by hand the way you do the iOS IPA.

#### Build and upload

1. iOS: Archive + Export in Xcode to `./build/BrekekePhone/<scheme name>.ipa` (see above).
2. Run `make phonedev` (from `master`) or `make phone` (from `release`) -- see [Makefile reference](./makefile-reference.md#build-and-upload-to-dev01) for exactly what each does. This builds the Android APK, then uploads both the IPA and the APK to `dev01`.
3. Once uploaded, the build is downloadable/installable from `https://dev01.brekeke.com/dev` -- the same page lists both the "Brekeke Phone Dev" and "Brekeke Phone" sections together, sorted by version (see `dev01/web/src/app/app.tsx`). Note there is no explicit `/dev` route in `dev01/api/nginx.conf`; it works because the catch-all `location /` (serving `dev01/web`'s build) falls back to `index.html` via `try_files` for any unmatched path, including `/dev`.
