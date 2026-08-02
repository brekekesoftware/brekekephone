### Android build

<!-- START doctoc -->

- [SDK tools on PATH](#sdk-tools-on-path)
- [Run in an emulator](#run-in-an-emulator)
- [Run on a real device](#run-on-a-real-device)
- [Release build](#release-build)
- [Troubleshooting](#troubleshooting)

<!-- END doctoc -->

All commands below assume the Metro bundler is already running (see [Getting started](./getting-started.md)) and that your shell is at the repo root unless a `cd` is shown.

#### SDK tools on PATH

- Windows:

```sh
%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools
%USERPROFILE%\AppData\Local\Android\Sdk\tools
%USERPROFILE%\AppData\Local\Android\Sdk\tools\bin
```

- Mac (see also https://stackoverflow.com/questions/26483370):

```sh
export ANDROID_HOME=/Users/$USER/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Run in an emulator

- Create a virtual device with Android Studio (`Tools > AVD Manager`) or the [command-line tool](https://developer.android.com/studio/command-line/avdmanager).
- Run it from Android Studio's AVD Manager, or `emulator -list-avds` then `emulator -avd <DEVICE_NAME>`.
- From `brekekephone/app`: `pnpm android`

#### Run on a real device

- Enable "Unknown sources" and Developer Mode on the device (varies by phone/Android version).
- Then:

```sh
adb devices
adb -s DEVICE_ID reverse tcp:8081 tcp:8081
cd brekekephone/app
pnpm android -- --deviceId=DEVICE_ID
```

#### Release build

```sh
cd brekekephone/app/android
./gradlew clean
./gradlew generateCodegenArtifactsFromSchema
./gradlew assembleRelease
```

The `generateCodegenArtifactsFromSchema` step is required because New Architecture/Turbo Modules are enabled (see [Architecture and startup](./architecture-and-startup.md)) -- skipping it can produce a build with stale/missing codegen artifacts.

The APK is written to `brekekephone/app/android/app/build/outputs/apk/release`. Upload it wherever your release process expects (internal server, Google Play Console, etc).

Enable LogCat if you need device logs: https://stackoverflow.com/questions/25610936

#### Troubleshooting

- `Emulator: ERROR: x86 emulation currently requires hardware acceleration!`
  - In Android Studio's SDK Manager, check `Intel x86 Emulator Accelerator`.
  - Open `%USERPROFILE%\AppData\Local\Android\sdk\extras\intel\Hardware_Accelerated_Execution_Manager` and run `intelhaxm-android.exe`. If already installed, remove then reinstall it.
  - If it reports `Intel Virtualization Technology (VT-x) is not turned on`, enable virtualization in your BIOS and reinstall `intelhaxm-android.exe`.
- Emulator boots into an endless `VCPU shutdown request` loop: a known Intel HAXM bug (https://issuetracker.google.com/issues/37124550). Remove and reinstall the latest HAXM.
- `You have not accepted the license agreements of the following SDK components`: `cd %USERPROFILE%\AppData\Local\Android\Sdk\tools\bin && sdkmanager --licenses`, then accept each license.
- Build errors right after `pnpm i` are often a dependency patch that failed to apply (see [SDK and dependencies](./sdk-and-dependencies.md)), not an app code issue.
