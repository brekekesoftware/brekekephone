### Environment requirement
- Install `yarn` and use it instead of `npm`.

### Android build & debug:
- The binary tools are located at the following locations. To use them directly in the command line, we should add them into the PATH environment variable:
  - `%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools`
  - `%USERPROFILE%\AppData\Local\Android\Sdk\tools`
  - `%USERPROFILE%\AppData\Local\Android\Sdk\tools\bin`

```sh
# Install node packages
# IMPORTANT: Do not run react-native link, the automation link has issues, we already link them manually
cd \path\to\test-brekeke-phone
yarn install
```

##### Run and debug app in Android Emulator:
- To create a virtual device:
  - Option 1: Using Android Studio: Go to `Tools > AVD Manager` to install a new virtual device.
  - Option 2: Using command line tool: Follow the instruction at: https://developer.android.com/studio/command-line/avdmanager
- To run the virtual device:
  - Option 1: Using Android Studio: In AVD Manager, click the Run button on the Emulator we want to run.
  - Option 2: Using command line tool: First `cd %USERPROFILE%\AppData\Local\Android\Sdk\emulator`. Then execute `emulator -list-avds` to list all virtual devices. Then execute `emulator -avd <DEVICE_NAME>` to run it.
- Start the react native bundle at the project root: `react-native run-android`.

- Some errors:
  - If we can not run the emulator and it throws an error like: `Emulator: ERROR: x86 emulation currently requires hardware acceleration!`. Try to follow these steps to fix:
    - In Android Studio, go to SDK Manager and make sure the option `Intel x86 Emulator Accelerator` is checked.
    - Open folder `%USERPROFILE%\AppData\Local\Android\sdk\extras\intel\Hardware_Accelerated_Execution_Manager\`.
    - Open `intelhaxm-android.exe`. If it shows that the installation is completed, we need to click the remove button to remove it, then reopen and reinstall it again.
    - When reinstalling, if it shows an error like: `... Intel Virtualization Technology (VT-x) is not turned on`: We need to restart the computer, enter the BIOS and configure the CPU to support Virtualization. After that try to reopen and reinstall `intelhaxm-android.exe` again.
  - The device starts up but the Command Line shows endless loop of `VCPU shutdown request`
    - This is a bug of Intel HAXM: https://issuetracker.google.com/issues/37124550
    - Remove the old HAXM then download and reinstall the latest HAXM version should fix this.
  - `You have not accepted the license agreements of the following SDK components`: Execute `cd %USERPROFILE%\AppData\Local\Android\Sdk\tools\bin` then `sdkmanager --licenses` then press y and enter for all licenses.

##### Run and debug app in a real device:
```sh
adb devices
adb -s DEVICE_ID reverse tcp:8081 tcp:8081
react-native run-android --deviceId=DEVICE_ID
```

##### Build the app in release mode and install it in the real device:
- At the project root execute: `cd android && gradlew clean && gradlew assembleRelease`.
- After the build is finished, the apk file is located at: `android\app\build\outputs\apk\release`.
- To enable LogCat: https://stackoverflow.com/questions/25610936


### iOS build & debug
- My current environment:
```sh
# macOS Mojave Version 10.14.1 (18B75)
# XCode Version 10.1 (10B61)

$ node -v
v11.4.0
$ react-native -v
react-native-cli: 2.0.1
react-native: 0.55.4
```

- Install dependencies
```sh
# Install node packages
# IMPORTANT: Do not run react-native link, the automation link has issues, we already link them manually
cd /path/to/test-brekeke-phone
yarn install

# Error: `... glog-0.3.4 ... 'config.h' file not found`
# https://github.com/facebook/react-native/issues/14382
cd node_modules/react-native
./scripts/ios-install-third-party.sh
cd ../../
cd node_modules/react-native/third-party/glog-0.3.4/
../../scripts/ios-configure-glog.sh
cd ../../../../

# Try to build the app to generate build folder
react-native run-ios

# Error: `... Build input file cannot be found ... /Libraries/WebSocket/libfishhook.a`
# https://github.com/facebook/react-native/issues/19569
cp ios/build/Build/Products/Debug-iphonesimulator/libfishhook.a node_modules/react-native/Libraries/WebSocket/
```

- In XCode, check all search paths and ensure they have $(inherited) value. Add one if there isn't any, otherwise there will be library linking error, or framework not found error. If any of these kind of errors still happens, add the missing node_module package to the search path.

##### Build iOS app for distribution
- Build main.jsbundle using command `yarn build:ios`
- Include the main.jsbundle in the Copy Bundle Resource section if haven't
- Request for distribution certificate and install it correctly on local machine
- Check the jsCodeLocation in AppDelegate.m for the correct config
- Archive and distribute for Ad-hoc / Team distribution

### TODO
- [ ] Add CODEPUSH_KEY in BuildConfig
- [ ] Add a loop and use RNFS.exist to check file exists before write
