### Android build & debug:
- The binary tools are located at the following locations. To use them directly in the command line, we should add them into the PATH environment variable:
  - `%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools`
  - `%USERPROFILE%\AppData\Local\Android\Sdk\tools`
  - `%USERPROFILE%\AppData\Local\Android\Sdk\tools\bin`

##### Run and debug app in Android Emulator:
- To create a virtual device:
  - Option 1: Using Android Studio: Go to `Tools > AVD Manager` to install a new virtual device.
  - Option 2: Using command line tool: Follow the instruction at: https://developer.android.com/studio/command-line/avdmanager
- To run the virtual device:
  - Option 1: Using Android Studio: In AVD Manager, click the Run button on the Emulator we want to run.
  - Option 2: Using command line tool: Execute `emulator -list-avds` to list all virtual devices. Then execute `emulator -avd <DEVICE_NAME>` to run it.
  - Caveat: If we can not run the emulator and it throws an error like: `Emulator: ERROR: x86 emulation currently requires hardware acceleration!`. Try to follow these steps to fix:
    - In Android Studio, go to SDK Manager and make sure the option `Intel x86 Emulator Accelerator` is checked.
    - Open folder `%USERPROFILE%\AppData\Local\Android\sdk\extras\intel\Hardware_Accelerated_Execution_Manager\`.
    - Open `intelhaxm-android.exe`. If it shows that the installation is completed, we need to click the remove button to remove it, then reopen and reinstall it again.
    - When reinstalling, if it shows an error like: `... Intel Virtualization Technology (VT-x) is not turned on`: We need to restart the computer, enter the BIOS and configure the CPU to support Virtualization. After that try to reopen and reinstall `intelhaxm-android.exe` again.
- Start the react native bundle at the project root: `react-native run-android`.

##### Run and debug app in a real device:
- Follow the instruction at https://facebook.github.io/react-native/docs/running-on-device#running-your-app-on-android-devices to run and debug the app in a real device.

##### Build the app in release mode and install it in the real device:
- At the project root execute: `cd android && gradlew clean && gradlew assembleRelease`.
- After the build is finished, the apk file is located at: `android\app\build\outputs\apk\release`.
- To enable LogCat: https://stackoverflow.com/questions/25610936

# Push Incoming calls
$pbx.src = ^true
$request = ^INVITE
$getSIPuser(To) = (.+)
$pn.user("%1") = true
X-PBX-EXINFO = (.+):(.+)/(.+)/(.+)  

&pn.notify.user = %1
&pn.notify.message = Incoming call
&pn.notify.custom = "body": "%{$getDisplayName(From)} - %{$getSIPuser(From)}", "tag": "incoming-call", "data": { "user": "%5", "host": "%2", "port": "%3", "tenant": "%4" }
$continue = true
X-PBX-EXINFO =  


# Wait REGISTER 
$request = ^INVITE
&pn.notify.user = (.+)
$registered = false

$wait4reg = %1
