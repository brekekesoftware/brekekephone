### Custom branding build instruction

- Make sure you are on `master` branch and has pulled all the latest changes
- First you need to follow the README and make sure the app running well on your local environment

- To update app name and bundle identifier, follow these steps with order:

  - Find and replace all the matches `Brekeke Phone Dev` with your new app name, this will be the display name of the app when user install on their phone
  - Find and replace all the mathces `Brekeke Phone` with your new app name, this will be the name displays inside the app after user open up
  - Find and replace all the matches `com.brekeke.phonedev` with your new app bundle
  - Rename the directory tree from `android/src/main/java/com/brekeke/phone` with your new app bundle
    - For example your new app bundle is `net.example.sip`, the directory tree will be `android/src/main/java/net/example/sip`

- To update app logo, replace the following images with your new images but keep the same name:
<details>
  <summary>Click to see all the files:</summary>

```
# For the icon of the app on android, these images need to be the same size:
android/src/main/res/mipmap-hdpi/ic_launcher.png
android/src/main/res/mipmap-mdpi/ic_launcher.png
android/src/main/res/mipmap-xhdpi/ic_launcher.png
android/src/main/res/mipmap-xxhdpi/ic_launcher.png
android/src/main/res/mipmap-xxxhdpi/ic_launcher.png
# For the icon on splash launch screen on android:
android/src/main/res/mipmap-hdpi/launch_screen.png
android/src/main/res/mipmap-mdpi/launch_screen.png
android/src/main/res/mipmap-xhdpi/launch_screen.png
android/src/main/res/mipmap-xxhdpi/launch_screen.png
android/src/main/res/mipmap-xxxhdpi/launch_screen.png

# For the icon of the app on ios, these images need to be the same size:
# TODO
# For the icon on splash launch screen on ios:
# TODO
```

</details>

- To update app branding color:

  - For splash screen:
    - Find and replace #74bf53 with your new color
    - Update `ios/Phone/Base.lproj/LaunchScreen.xib` at the node `<color key="backgroundColor"` with your new color
  - For other in app colors:
    - Open `src/-/variables.js` and update the primary color there
    - You can also update other colors their as you want

- For the push notification and build/distribution, please follow the instruction in README.md
