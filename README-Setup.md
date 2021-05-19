### Software installation to Run React-native app in MacOs

Refer the official guide to install all the softwares needed -
"https://reactnative.dev/docs/environment-setup"

Below are the steps summarised in official guide:

      -> Install brew from this link "https://brew.sh"
      -> Install Node an Watchman with below commands
          brew install node
          brew install watchman
      -> Install Xcode from this link "https://apps.apple.com/us/app/xcode/id497799835?mt=12"
      -> Configure Xcode by following steps mentioned in the official guide with the header
         "Command Line Tools#"  and "Installing an iOS Simulator in Xcode#"
      -> Install cocoapods by running below command
         sudo gem install cocoapods
      -> Install Yarn by running below command
         npm i -g yarn
      -> Download Android studio from below link "https://developer.android.com/studio?gclid=CjwKCAjwqIiFBhAHEiwANg9szi9ak__Mkmp4xxkrVqJnlD2LMHIuyO_Eed0b59fnywnTfj1GvFuZVRoCG98QAvD_BwE&gclsrc=aw.ds"


### Running Brekekephone project

     -> Create github account
     -> Request access for github Brekekephone project- Project url - https://github.com/Tam-One/brekekephone
     -> Download github project in local machine by running below command
        git clone https://github.com/Tam-One/brekekephone.git
     -> Go to brekekephone folder and run below command
        yarn
     -> Run below command to start metro bundler
        yarn rn
     -> If it showed any errors run below command
        yarn cache clean && yarn --check-files && yarn rn --reset-cache

### Solving build issues

     -> In the project we used google-services.json, If we build our project we will get an error saying
        "google-services.json" file not found. To fix this we can do two things.
         --- Comment below line from android/app/build.gradle file
            apply plugin: "com.google.gms.google-services"
         --- Or generate that file by following below steps
                Login in below link with google account
                  https://console.firebase.google.com/
                  Cick on "Add Project", give project name is "Qooqie" and complete the process by presing continue in coming pages.
                  Once project is created, click on android symbol to create an app. Fill below details in that form
                   -> Android package name :  com.brekeke.phonedev
                   -> App nickname:  brekeke
                   Press register button, you will get google-services.json file to download. Download it and place it in project "brekekephone/Android/app" folder
     -> Another issue you will get is "turnConfig.ts" is not found
        To fix this add a file with name "turnConfig.ts" in project "brekekephone/src/api" folder and write below code in the file
         export default null;

### Running project in emulator

- To create a virtual device:
  - Option 1: Using Android Studio: Go to `Tools > AVD Manager` to install a new virtual device
  - Option 2: Using command line tool: Follow the instruction at: https://developer.android.com/studio/command-line/avdmanager
- To run the virtual device:
  - Option 1: Using Android Studio: In AVD Manager, click the Run button on the Emulator we want to run
  - Option 2: Using command line tool: Execute `emulator -list-avds` to list all virtual devices. Then execute `emulator -avd <DEVICE_NAME>` to run it. If you are on Windows, you may need to `cd %USERPROFILE%\AppData\Local\Android\Sdk\emulator` first
- Start the react native bundle at the project root: `yarn android`

### Run and debug app in a real device:

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

### Run in ios simulator

Install Pods: cd ios && pod install --repo-update
Start development: yarn ios
Sometimes we need to clear cache if it doesn't reflect changes or has some strange errors: rm -rf ios/build/_ && rm -rf ~/Library/Developer/Xcode/DerivedData/_
To have the push notification permision and other permission related popups show up again, we need to uninstall the app before reinstalling it
