### Custom branding build instruction

<!-- START doctoc -->
<!-- END doctoc -->

- Make sure you are on `master` (or your release branch) and have pulled all the latest changes.
- First follow [Getting started](./getting-started.md) and make sure the app runs well on your local environment.

- To update the app name and bundle identifier, in this order:
  - Find and replace all matches of `Brekeke Phone Dev` with your new app name -- this is the display name shown when the user installs the dev build.
  - Find and replace all matches of `Brekeke Phone` with your new app name -- this is the name shown inside the app.
  - Find and replace all matches of `com.brekeke.phonedev` with your new app bundle id.
  - Rename the directory tree from `brekekephone/app/android/app/src/main/java/com/brekeke/phonedev` to match your new bundle id.
    - For example, if your new bundle id is `net.example.sip`, the directory tree becomes `brekekephone/app/android/app/src/main/java/net/example/sip`.

- To update the app logo/icon, replace the following images with your own but keep the same file names:

```
# Android app icon, these images need to be the same size as the originals:
brekekephone/app/android/app/src/main/res/mipmap-hdpi/ic_launcher.png
brekekephone/app/android/app/src/main/res/mipmap-mdpi/ic_launcher.png
brekekephone/app/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
brekekephone/app/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
brekekephone/app/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
# Android splash/launch screen icon:
brekekephone/app/android/app/src/main/res/mipmap-hdpi/launch_screen.png
brekekephone/app/android/app/src/main/res/mipmap-mdpi/launch_screen.png
brekekephone/app/android/app/src/main/res/mipmap-xhdpi/launch_screen.png
brekekephone/app/android/app/src/main/res/mipmap-xxhdpi/launch_screen.png
brekekephone/app/android/app/src/main/res/mipmap-xxxhdpi/launch_screen.png

# iOS app icon (all sizes, including the App Store icon):
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon-appstore.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon20.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon29.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon40.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon58.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon60.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon76.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon80.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon87.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon120.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon152.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon167.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/AppIcon.appiconset/icon180.png
# iOS splash/launch screen logo:
# If you change this image's size, you may also need to update
#   brekekephone/app/ios/BrekekePhone/LaunchScreen.storyboard
brekekephone/app/ios/BrekekePhone/Images.xcassets/LaunchScreenLogo.imageset/LaunchScreen.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/LaunchScreenLogo.imageset/LaunchScreen@2x.png
brekekephone/app/ios/BrekekePhone/Images.xcassets/LaunchScreenLogo.imageset/LaunchScreen@3x.png

# Web favicon:
brekekephone/web/public/favicon.ico
# Web/app mobile startup logo:
brekekephone/app/src/assets/brand.png
brekekephone/app/src/assets/logo.png
```

- To update the app's branding color, note this app has two separate places that each hold their own brand color -- they are not the same value today, so update both deliberately rather than assuming one covers the other:
  - Native splash screen background: open `brekekephone/app/ios/BrekekePhone/LaunchScreen.storyboard` in Xcode and change the view's background color there (use Xcode's color picker rather than hand-editing the decimal RGB numbers in the XML). The equivalent Android splash background comes from the `launch_screen.png` images above, not a color value.
  - In-app theme color: the primary color is a full light/dark scale (`--primary-50` through `--primary-950`, plus `--ring`), defined in two files that must be kept in sync with each other (the second file has a comment saying exactly this):
    - `brekekephone/app/src/theme/brekeke.scss` (CSS custom properties, `:root`/dark-mode block)
    - `brekekephone/app/src/theme/brekeke-scss.ts` (the same values, extracted manually into TypeScript because auto-extracting them wasn't practical with the app's build pipeline)
  - You can also update the other color scales (`--secondary-*`, `--info-*`, `--success-*`, `--warning-*`, `--error-*`) in the same two files if you want to change more than just the brand color.

- Credentials, keystores, and version bump locations are covered in [Credentials and config](./credentials-and-config.md) -- go there for `google-services.json`, the release keystore, TURN config, and where to bump the app version.

- For push notifications specifically:
  - Update the FCM application id (`fcmApplicationId` in `brekekephone/app/src/config.ts`) to your own Firebase project's sender id.
  - Then follow [Push notification setup](./push-notification-setup.md) and [iOS build](./ios-build.md)/[Android build](./android-build.md) to configure push notifications and produce a production build, archive, and distribution.
