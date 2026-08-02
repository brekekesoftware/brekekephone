### Building for the App Store and Play Store

<!-- START doctoc -->

- [Before you start](#before-you-start)
- [iOS: App Store](#ios-app-store)
- [Android: Play Store](#android-play-store)

<!-- END doctoc -->

This is the official public-release path, distinct from [Building and deploying to dev01](./dev01-deploy.md) (internal ad-hoc testing builds). This is always built from the `release` branch (`com.brekeke.phone`), never from `master` -- see [Branching strategy](./branching-strategy.md) for what `release` is and how it's kept ready.

#### Before you start

- Make sure `release` has actually been rebased onto the latest `master` and verified to build/run correctly (see [Branching strategy](./branching-strategy.md#the-release-workflow)) -- don't submit a stale `release` branch.
- Bump the version in all three places (see [Credentials and config](./credentials-and-config.md#version-bump-locations)): root `package.json`'s `appVersion`, `brekekephone/app/android/app/build.gradle`'s `versionCode`/`versionName`, `brekekephone/app/ios/BrekekePhone/Info.plist`'s `CFBundleShortVersionString`.
- Add a `CHANGELOG.md` entry for the new version before or as part of the release commit.
- Once shipped, cut a version branch from the exact released commit (see [Branching strategy](./branching-strategy.md#version-branches-as-a-fixed-reference)).

#### iOS: App Store

1. Make sure a valid distribution certificate and the `release`-branch (`com.brekeke.phone`) provisioning profile are installed locally (see [Building and deploying to dev01](./dev01-deploy.md#ios-provisioning-profile-requirements) for what capabilities that profile needs -- push, VoIP, LPC network extension, app group, etc. -- the App Store profile needs the same set, just with App Store distribution instead of Ad-hoc/Enterprise).
2. In Xcode, Archive the app.
3. Use Xcode's Organizer to validate the archive (catches many App Store Connect rejection reasons before you actually submit), then distribute it to App Store Connect.
4. In App Store Connect, fill in release notes/metadata as needed and submit for review.

#### Android: Play Store

1. Get the release keystore file from whoever manages it for this product (see [Building and deploying to dev01](./dev01-deploy.md#android-keystore) -- the alias/password are already fixed in `build.gradle`, only the keystore file itself is a secret you need to obtain).
2. Build the release APK/AAB: `cd brekekephone/app/android && ./gradlew clean && ./gradlew generateCodegenArtifactsFromSchema && ./gradlew assembleRelease` (or `bundleRelease` for an AAB, if the Play Console listing expects one) -- the `generateCodegenArtifactsFromSchema` step matters because New Architecture/Turbo Modules are enabled (see [Architecture and startup](./architecture-and-startup.md)).
3. Upload the signed build to the Google Play Console, fill in the release notes, and roll it out per whatever release track (internal/closed/open/production) is appropriate.
4. Double check the Play Console's declared permissions (microphone/camera/phone-call/foreground-service `specialUse`, etc.) still match what the app actually requests -- see [Permissions and ringtone](./permissions-and-ringtone.md); this has been a source of real rejections/hotfixes before.
