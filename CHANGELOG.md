#### 2.9.0

- Update webrtcclient to 2.0.30.333
- Update ucclient to 1.2.9.6u2294
- Add feature UC Buddy group select
- Allow to add label/name for each park
- Enhance performance for emoji selector in chat
- Click on the top call bar notify should be able to go back to page call manage, to see other background calls if any
- Fix bug shared contacts not load correctly
- Fix search phonebook/contact params call to api
- Fix bug press on chat notification, app should log in automatically
- Android: Add feature displaying avatar in Push Notification, white background, also handle large image case
- Android: Fix bug press on the notification should navigate, on killed state
- Android: Fix bug open image in chat sometimes get black screen and can not go back

#### 2.8.62

- Incoming call and outgoing call should be hold correctly in the order of answer
- Test and verify gsm conflict with LTE:
  - If VoLTE is enabled: all issues are resolved
  - If VoLTE is not enabled: BrekekePhone calls alway disconnect when having gsm call
- Test and verify some other bugs

#### 2.8.61

- Android: Try fix click notification in killed state should navigate to page recent calls
- Android: Add bluetooth permission and test bluetooth earphone (still has some issues)
- Add missing locale labels
- If there's no locale selected, system locale will be selected by default
- Update missed call notification as Akira requested: title={{name || number}} body="Missed call"

#### 2.8.60

- Fix chat load more scroll issue
- Fix phonebook loading issue, implement search phonebook, 20 items per load
- Reject call should not show notification
- Android: Try fix click notification in killed state should navigate to page recent calls
- Open deeplink url should work in background, if there's no on going sip session then login to that account
- Deeplink param phone_idx outside of 1-4 should be converted to 4

#### 2.8.59

- Show notification for missed call, badge number will be updated
- Click on the notification will go to page list recent calls and reset the badge number
- Quick button to call voice mail
- Remove @mdi/js package to reduce bundle size

#### 2.8.58

- Fix android 348: answer from notification list should have audio working correctly on android 11

#### 2.8.57

- Fix android 347: receiving an incoming GSM call while brekeke phone is dialling out, and pickup the GSM call first: voice should work correctly
- Fix android 348: answer from notification list
- Fix android 349: should not show message "Failed to hold/unhold the call"
- Fix the 2 remaining issues on ios from 2.8.55:
  - ios PN disabled, app opening foreground - receive call+answer gsm first, then incoming brekeke call
  - ios receive call+answer gsm first, then outgoing brekeke call (PN setting not relevant in this case of outgoing call)

#### 2.8.55

- Fix bug conflict with regular phone call

#### 2.8.52

- Fix ios 340: when having outgoing BrekekePhone call and regular phone call come, press answer+end should end BrekekePhone call
- Handle x_displayname in PN data, now it should display well Japanese characters in PN screen
- Fix ios 336: forground should not reject 1st call when receiving 2nd call
- Fix 335: forground should display call notify in some edge cases
- Fix 334: forground should not ring in app if there's an ongoing answered call
- Fix bug ringback not play, increase ringback volume
- Fix ios: when app killed and device locked, incoming call doesnt show Brekeke logo
- Improve call history: should display correct name from phone number (via phonebook) or extension (via pbx users)
- Fix bug: hold status should be updated when transfer attended/conference
- Remove labels in app: "Incoming audio/video call" -> "Incoming call"
- Fix 332: call notify should display after exit page call manage, add logic to respect silent mode
- Fix android 327: vibration/ringtone should stop after press answer foreground
- Fix android: sometimes app crashes on first open after reinstall
- Fix 330: error when toggle video while connected to voicemail

#### 2.8.49

- Fix android bug: caller got busy tone if callee press answer quickly
- Fix android bug: should not vibrate after PN closed
- Fix android 327: ringtone should stop after answer multi calls forground mode
- Fix 328: end call in Parks should go back out of CallManage view
- Fix ios 322: should not show/ring regular call bar if PN already show
- Should not show error message if failed to connect
- If connection failed, press on the red error message on the top should trigger reconnect

#### 2.8.45

- Fix android bug incoming call not stop
- Fix android bug related to vibration
- Fix 316: disallow toggle video if currently on hold
- Fix 309: update hold status when user resume call from transfer
- Fix android 256: app should show RN view in case: answer -> press button home -> unlock -> manually open app
- Update multi-lingual labels

#### 2.8.41

- Add `"webphone": "true"` to pal `getProductInfo`
- Upgrade react-native `0.64.2 -> 0.65.1`
- Fix 317: call should not be displayed after being rejected then reconnect

#### 2.8.40

- Fix dtmf should call pbx pal
- Fix empty talker_id in dtmf
- Remove call button in page dtmf keypad
- Rename pbx config `webphone.dtmf.pal -> webphone.dtmf.send.pal`
- Android use partial wake lock

#### 2.8.37

- Update timer to not end the call until pbx timeout
- Fix ios auto end outgoing call after 20s
- Android support incoming video call when device locked
- Change video object fit to cover

#### 2.8.34

- Update webrtcclient.js use destroyWebRTC() when reconnect on new notification
- Android improve PN's wakeup time | call callkeep directly in java code
- Fix android bug can not display multiple calls

#### 2.8.32

- Android improve PN's wakeup time
- Android PN screen (device locked) if user pressed answer but call is still not connected, then show a message `Connecting...` with loading icon
- Android PN screen add multi lingual locale
- SIP add some logic to jssip fork to disable web socket send after calling \_ua.\_transport.socket.disconnect() then also call stopWebRTC() - not sure if this change actually improves the connection, please test
- Fix android sometimes PN not received in js code, because of the fcm lib
- Some other small improvements and dependencies update

#### 2.8.30

- Android show timestamp as soon as PN received. For debug purpose, first step of speeding up wake time for PN screen. This is on dev version only and will be migrated/removed when we completely done with speeding up
- Fix call should be connected via SIP PN token (PN token get flushed mistakenly)
- Fix android call should be able to connect or drop after connected for a while (by adding wake lock)
- Fix current call should not become on hold after end a background call
- Fix android bug PN screen should disappear in a case of multiple incoming calls
- SIP use `phone._ua._transport.socket.disconnect()` instead of `phone.stopWebRTC()`
- Android attempt to fix bug crash on open after reinstall the app

#### 2.8.21

- Auto accept/display image/video on UC chat. Certain kinds of file extensions are supported differently on each platform browser/ios/android. Generally jpg image and mp4 video
- Reconnect SIP if PN token is expired or timeout of 10s
- Try to cancel/not displaying the PN if caller canceled the call: add more logic and fix bugs
- Insert call history for cancelled PN calls
- Improve PN settings (enabled/disabled) loading (remove the loading icon covers the whole login screen, only show it on the switcher). Only show error if user proactively changes the setting
- Add group chat icon to make it different with user icon
- Add call history on group chat call, fix incorrect group name in call history
- Fix proximity sensor. There are still some cases not fixed yet:
  - ios outgoing call
  - android working well on some brands, but unstable on other brands (need to investigate more)
- Show message instead of hangup button when call on hold
- Improve in-app notify+ringtone to not conflict with PN: hide in-app notify if it has PN for that call, if no PN for that call, still show notify as usual
- Improve ios PN: try to get caller name directly instead of `Loading...` message
- Decode UC messages (they were encoded on server side)
- Some other bugs:
  - bug `_ua.isRegistered null`
  - bug android back button not working properly
  - bug with transfer hold/hangup
  - bug show `Connecting...` after end call
  - bug in debug log
