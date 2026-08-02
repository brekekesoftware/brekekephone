### Credentials and config

<!-- START doctoc -->

- [Local-only files](#local-only-files)
- [TURN config](#turn-config)
- [Version bump locations](#version-bump-locations)

<!-- END doctoc -->

These files vary per brand/customer/build environment, so most of them are gitignored -- you need your own copies to build a working app. See [Custom branding build](./custom-branding.md) if you are setting up a rebranded build rather than just running this repo as-is.

#### Local-only files

- `brekekephone/app/android/app/google-services.json` -- Firebase config for Android push notifications. Download from your Firebase console (https://support.google.com/firebase/answer/7015592).
- `brekekephone/app/android/keystores/release.keystore` -- Android release signing key. Generate one from the terminal or Android Studio if you don't have an existing app; keep it and reuse it for every build of the same app (https://developer.android.com/training/articles/keystore). If you already have a published app under the same bundle id, reuse its existing keystore instead of generating a new one.
- `brekekephone/app/src/api/turn-config.local.ts` -- see [TURN config](#turn-config) below.
- iOS push notifications (APNs) and the LPC app-push-provider entitlement are configured directly in Xcode (`General`, `Info.plist`, `BrekekePhone.entitlements`) and in your PBX admin push notification settings, not via a local file in this repo.

If any of these are missing, a release build failure is very likely a missing local file, not a source code issue.

#### TURN config

`brekekephone/app/src/api/turn-config.local.ts` exports the TURN config used for WebRTC. Most setups don't need TURN to establish a call; the checked-in default is:

```ts
export const turnConfig = {}
```

If you do need TURN, give it a real `pcConfig.iceServers` list instead:

```ts
export const turnConfig = {
  pcConfig: {
    iceServers: [
      {
        urls: 'turn:HOST:PORT/PATH',
        username: 'USERNAME',
        credential: 'PASSWORD',
      },
      // other ice servers
    ],
  },
}
```

See also https://github.com/coturn/coturn if you need to run your own TURN server.

#### Version bump locations

Keep these in sync for a release (see [Config and build](./config-and-build.md) for how the Makefile uses the root version):

- `package.json` (root) -- `appVersion`, also what `CHANGELOG.md` is organized by
- `brekekephone/app/android/app/build.gradle` -- `versionCode`/`versionName`
- `brekekephone/app/ios/BrekekePhone/Info.plist` -- `CFBundleShortVersionString`
