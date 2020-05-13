### Quick access

- [Custom branding build instruction](./doc/custom-branding-instruction.md)

### Environment requirement

- Should have the latest node version 14.x
  - You can use `nvm` to install and manage node versions: https://github.com/nvm-sh/nvm
- Install `yarn` and use it instead of `npm`: `npm install -g yarn`
- Install node packages:

```sh
# IMPORTANT: Do not run react-native link, we already linked them manually because the automation link has issues sometimes
cd /path/to/brekekephone
yarn
```

- Start the metro bundler and let it running

```sh
yarn rn
```

- If it has some strange errors, we may need to delete node_module then reset cache as well

```sh
yarn cache clean && yarn --check-files && yarn rn --reset-cache
```

### Keystores and other credentials keys

- You need to contact us to download or generate your own following files:
  - `android/src/google-services.json`
  - `android/keystores/development.keystore`
  - `android/keystores/release.keystore`
  - `src/-/api/turnConfig.js`
- Most of the cases you don't need to use TURN to establish the call. You can put `export default null;` in `turnConfig.js` and keep the TURN feature turned off. Example of real config:

```js
export default {
  pcConfig: {
    iceServers: [
      {
        urls: 'turn:HOST:PORT/PATH',
        username: 'USERNAME',
        credential: 'PASSWORD',
      },
      // Other ice servers...
    ],
  },
}
```

### Android

##### Android SDK tools

- The binary tools are located at the following locations. To use them directly in the command line, we should add them into the PATH environment variable:
- Windows:

```sh
%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools
%USERPROFILE%\AppData\Local\Android\Sdk\tools
%USERPROFILE%\AppData\Local\Android\Sdk\tools\bin
```

- Mac: https://stackoverflow.com/questions/26483370

```sh
export ANDROID_HOME=/Users/$USER/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

##### Run and debug app in Android Emulator:

- To create a virtual device:
  - Option 1: Using Android Studio: Go to `Tools > AVD Manager` to install a new virtual device
  - Option 2: Using command line tool: Follow the instruction at: https://developer.android.com/studio/command-line/avdmanager
- To run the virtual device:
  - Option 1: Using Android Studio: In AVD Manager, click the Run button on the Emulator we want to run
  - Option 2: Using command line tool: Execute `emulator -list-avds` to list all virtual devices. Then execute `emulator -avd <DEVICE_NAME>` to run it. If you are on Windows, you may need to `cd %USERPROFILE%\AppData\Local\Android\Sdk\emulator` first
- Start the react native bundle at the project root: `yarn android`

- Some errors:
  - If we can not run the emulator and it throws an error like: `Emulator: ERROR: x86 emulation currently requires hardware acceleration!`. Try to follow these steps to fix:
    - In Android Studio, go to SDK Manager and make sure the option `Intel x86 Emulator Accelerator` is checked
    - Open folder `%USERPROFILE%\AppData\Local\Android\sdk\extras\intel\Hardware_Accelerated_Execution_Manager`
    - Open `intelhaxm-android.exe`. If it shows that the installation is completed, we need to click the remove button to remove it, then reopen and reinstall it again
    - When reinstalling, if it shows an error like: `... Intel Virtualization Technology (VT-x) is not turned on`: We need to restart the computer, enter the BIOS and configure the CPU to support Virtualization. After that try to reopen and reinstall `intelhaxm-android.exe` again
  - The device starts up but the Command Line shows endless loop of `VCPU shutdown request`
    - This is a bug of Intel HAXM: https://issuetracker.google.com/issues/37124550
    - Remove the old HAXM then download and reinstall the latest HAXM version should fix this
  - `You have not accepted the license agreements of the following SDK components`: Execute `cd %USERPROFILE%\AppData\Local\Android\Sdk\tools\bin` then `sdkmanager --licenses` then press y and enter for all licenses

##### Run and debug app in a real device:

- Prepare with the real device:
  - Go to Settings > Privacy
  - Enable "Unknown Sources" (Allow installation of apps from unknown sources)
  - We may need to enable Developer Mode as well, each phone has a different way to enable it, please give a search on the internet if you don't know how
- Then run those commands on the computer:

```sh
adb devices
adb -s DEVICE_ID reverse tcp:8081 tcp:8081
yarn android --deviceId=DEVICE_ID
```

##### Build app in release mode and install it in a real device:

- At the project root execute: `cd android && ./gradlew clean && ./gradlew assembleRelease`
- After the build is finished, the apk file is located at: `android/app/build/outputs/apk/release`. We can upload the apk file to our server or to Google Play Dashboard for a new release
- To enable LogCat: https://stackoverflow.com/questions/25610936

### iOS

- Development: `yarn ios`
- Sometimes we need to clear cache if it doesn't reflect changes or has some strange errors: `rm -rf ios/build/* && rm -rf ~/Library/Developer/Xcode/DerivedData/*`
- To have the push notification permision and other permission related popups show up again, we need to uninstall the app before reinstalling it

##### Build app for distribution

- Request for distribution certificate and install it correctly on local machine if haven't
- Archive and distribute for Ad-hoc / Team distribution to manually upload to our server so the others can download and test
- We can also choose to validate for App Store to see if it has any issue, then distribute it to App Store for a new release

### Push notification issues

- Android
  - Ensure latest google-services.json
  - Ensure correct server api key in the sip proxy server
    - Contact us at support@brekeke.com if you want to add your custom key/token
- iOS
  - Ensure the push notification gets configured correctly in General, Info.plist, Phone.entitlements
  - Ensure correct api key (string or file) in sip proxy server
    - Contact us at support@brekeke.com if you want to add your custom key/token

### Automation format tools

- To have the js/ts files follow a single code format consistency, you can run `yarn pret`
  - It will be automatically run in each commit via `husky` and `lint-staged`
- To run the format command for all possible files `yarn f`, we must install the following packages:

```sh
brew install clang-format google-java-format xmlstarlet
npm install -g imagemin-cli
```
