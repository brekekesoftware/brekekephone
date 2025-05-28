#### 2.16.3

- Improve debug log with multiples files, and mark for login logout
- Fix it should login into the correct account when press on the missed call notification (issue 955)
- Fix it should update avatar without cache in the next call (issue 958)
- Fix it should display name from phone book in calls (issue 960)
- Fix android it should have notification sound after a missed group call answer simultaneously (issue 974)
- Fix ios auto answer it should have audio (issue 975, 978, 1008)
- Fix it should show UC notification in call manage screen (issue 982)
- Fix it should remove PN token if login from another device even if there is an ongoing call (issue 1003)
- Fix android it should resolve dialer permission automatically when there is an incoming call (issue 1006)

#### 2.16.2

- Embed:
  - Add support for user agent in embed login options

#### 2.16.1

- Upgrade webrtcclient to 2.0.37.356
- Fix video conference it should work with UC desktop
- Fix web browser access front camera on mobile devices

#### 2.16.0

- Initial implementation of video conference

#### 2.15.10

- Fix ios it should not crash when press hold

#### 2.15.9

- Implement pal ping interval and reconnect mechanic based on the last activity timestamp
  - webphone.pal.ping_interval, default 20s
  - webphone.pal.ping_timeout, default 30s

#### 2.15.8

- Fix android 13 14 it should have microphone work in background with multiple calls, by patching callkeep library (issue 1017)

#### 2.15.7

- Fix android 14 it should have microphone work in background, by adding new permissions (issue 1016)

#### 2.15.6

- Fix it should getPhoneAppliContact properly when the pbx disconnects during a request (issue 998)
- Fix it should reconnect pbx when in background mode (issue 1005)
- Fix it should work properly without hanging when pressing a PN item (issue 1009)
- Fix it should work proplery in transfer video, affected by the previous issue 934 (issue 1010)
- Fix it should reconnect pbx after wake up from background mode in GSM internet (issue 1012)
- Add logic to only get contacts and sync PN token after 10m from the last pbx connect

#### 2.15.5

- Fix notify_park

#### 2.15.4

- Try fix some issues related to timeout and interval

#### 2.15.3

- Fix it should reconnect pbx on notification if it has been in background for more than 10s
- Update line selection: label for no line, remove duplicated
- Implement webphone.http.useragent.product to inject user agent for webview avatar
- Fix ios auto answer 3pcc (issue 980)
- Fix improvements for notify_pal (issue 990, 991, 992)
- Embed:
  - Fix it should emit call_update correctly

#### 2.15.2

- Implement webphone.resource-line line selection
- Implement notify_pal to show error when login the same phone index on another device
- Implement webphone.recents.max, default 200, max 1000
- Implement copy phone number to clipboard
- Fix web outgoing call should not make twice (issue 985)
- Try fix call hangup unexpectedly while sip reconnect with proximity sensor (issue 988)

#### 2.15.1

- Upgrade android target sdk 34 to update with Google policy
- Implement push notification timestamp
- Fix it should not reload custom page after reconnect internet/server (issue 793)
- Fix ios it should not connect lpc multiple (issue 853, 881)
- Fix it should show "answered by <ext>" in call history (issue 862)
- Fix it should reconnect on pbx/sip/uc failed automatically (issue 866)
- Fix it should show "answered by <ext>" when users of group answer simultaneously (issue 887)
- Fix ios it should keep the call when screen is off by proximity sensor for 90 seconds (issue 891)
- Fix it should be touchable to toggle buttons in video calls (issue 897)
- Fix ios remove all auto answer code because of not supported (issue 902)
- Fix android it should answer call immediately with x_autoanswer (issue 908)
- Fix it should answer incoming PN call after reconnecting due to PBX restart (issue 909)
- Fix it should display call duration correctly after manually allow Notification permissions (issue 918)
- Fix it should load video when turning it on from a voice call (issue 934)
- Fix it should play RBT when make call without SDP (issue 964)

#### 2.14.10

- Implement runtime permissions request
- Fix webphone can not load video in firefox nightly

#### 2.14.7

- Fix it should be able to open Brekeke Phone with PhoneAppli disabled/enabled on pbx

#### 2.14.6

- Fix ios it should clear badge number when tapping on PN or navigate to call history with PhoneAppli

#### 2.14.5

- Fix it should display well custom page when pbx reconnect (issue 885)
- Fix android it should not have oneway voice with auto answer (issue 879)
- Fix android it should display PhoneAppli image correctly during 3PCC calls with auto answer (issue 878)
- Fix it should not cut off hang up button in small screen (issue 877, 889)
- Fix ios it should make call correctly when invoke app immediately from PhoneAppli (issue 876)
- Fix android it should display well ringing image with PhoneAppli (issue 875)

#### 2.14.4

- Fix it should not show duplicated PN when changing phone index (issue 873)
- Fix it should reset PhoneAppli getProductInfo if logout (issue 868)
- Fix it should reset navigation PhoneAppli if update account to a new one (issue 867)

#### 2.14.3

- Fix it should display well with html characters < >
- Fix it should reconnect UC after put app in background and restart server (issue 866)
- Fix it should play RBT correctly with 18x status code (issue 864)
- Fix ios it should have call audio correctly with low latency response (issue 861, 863)
- Fix it should not display avatar twice in case PhoneAppli enabled (issue 860)
- Fix it should not encode special characters (issue 859)
- Fix it should navigate to PhoneAppli if enabled and tapping on a missed call notification (issue 856)
- Fix android it should handle the case user reject permission default dialer phone app (issue 855)
- Fix ios it should show LPC PN message for UC chat when it goes offline (issue 853)
- Fix android it should display UI correctly with auto answer (issue 851)
- Fix android it should not play notification sound if phone is in vibration mode (issue 756)
- Fix android it should have single vibration on notification instead of double (issue 752)
- Fix it should display layout better when keyboard open in call with X-PBX-IMAGE-TALKING and long name (issue 740)

#### 2.14.2

- Update intl local language labels

#### 2.14.1

- Android implement set BrekekePhone as the default OS dial (not possible on ios)
- Implement webphone.phonebook.personal.editable
- Improve and fix custom page url:
  - Fix android it should stop loading correctly in webview (custom page or avatar) in some cases
  - Fix it should load custom page with only param from-number
  - Fix it should reload custom page if url doesnt include #pbx-token#
  - Minor fix css overlap header in custom page
- Improve and fix UC chat notification:
  - Fix it should load recent chats when open the app by tapping on a notification (issue 827)
  - Improve it should not log in if PN is received without user tapping
  - Improve it should navigate to screen chat detail instead of screen chat recents when user tapping on a UC chat notification
- Implement PhoneAppli linking
- Show information when an incoming call is canceled in certain cases

#### 2.13.7

- Fix and adapt UC chat push notification according to server change

#### 2.13.6

- Improve page custom pbx user settings: update title display and loading state
- Improve avatar should not show loading indefinitely

#### 2.13.5

- Fix it should not stuck on call screen if very quickly answer edge case multiple calls (issue 820)

#### 2.13.4

- Fix it should not crash if very quickly answer edge case multiple calls (issue 814)
- Fix it should not retry to make call again if user has ended the pending call (issue 815)

#### 2.13.3

- Disable adding OS call history
- Fix it should include X-Requested-With header in webview, the value will be com.brekeke.phone or com.brekeke.phonedev depends on the build
- Fix ios it should not show error in avatar: do not load webview if the url is empty
- Fix it should not open dev version if try to open from webphone
- Fix ios open from url should work without crash
- Fix custom page webview handle redirect on client side (issue 795)
- Fix it should use try catch while loading custom page to have backward compatibility (issue 807)
- Fix android it should not show loading screen after hangup a call case: app killed with multiple calls (issue 805)
- Embed:
  - Add api to change ringtone

#### 2.13.2

- Implement call history first simple version:
  - Allow to add call history into native OS history on both android ios
  - Allow to make call from native OS history
  - When the call is made from the native OS history, it will automatically login into the last signed account and perform sip make call in that account
- Fix ios apns token not resolve properly
- Fix custom page params such as #pbx-token# should ignore case
- Fix it should trim account hostname, port, username, password
- Fix android should not show incoming call if the notification is disabled from OS app settings (issue 777)
- Fix android should show the correct call in multiple calls case: app killed then press back button to make an outgoing call (issue 775)
- Fix android should not show home screen after ending incoming call in multiple calls case: press home then receive incoming call then press back button to make an outgoing call (issue 774)
- Fix hold button should not allow to toggle multiple times immediately (issue 770)
- Fix uc should load buddy list case receiving call while connecting (issue 769)
- Fix park number should only allow characters: 0-9 a-z A-Z - \_ (issue 767)
- Embed:
  - Fix global web phone css injection

#### 2.13.1

- Embed:
  - Add acceptBrowserPermission to show when manually prompt for permission

#### 2.13.0

- Implement custom page using webview first simple version:
  - Only support 1 page
  - The settings must be case sensitive all lowercase to work
  - On web browser, can not get the page title from iframe if not on the same origin
  - On web browser, can not get http reponse code to handle specific code such as 401 to reload
- Parse password when open app from url, affect all build: web browser, ios, android
- Embed:
  - Update pal.js to support `line` method

#### 2.12.10

- Fix android it should navigate correctly in killed state after end call (issue 772)
- Fix it should not have 3-way voice when answer background call in notify bar (issue 771)
- Fix ios it shoud not crash signal 11, by upgrading webview library (issue 765)

#### 2.12.9

- Fix it should not open chat recents if receive call PN even UC disabled
- Fix android it should work normally when app killed and receive PN

#### 2.12.8

- Fix ios it should receive LPC with a newly created pbx account, or newly changed device (issue 760, 763)
- Fix ios it should not play incoming call duplicate ringtone in case PN is turned off (issue 739)

#### 2.12.7

- Update ios permissions config to resolve app store requirements

#### 2.12.6

- Sync pn token whenever phone index updated (issue 743, 758)
- Fix android it should switch the call correctly using the hardware task manager button (issue 706)
- Fix ios audio should work correctly case multiple calls on 2nd incoming call when app killed or device locked (issue 615, 642, 648)

#### 2.12.5

- Fix android it should not unmute when enable loud speaker (issue 750)
- Fix it should open file picker when select option button "More..." (issue 738 reopen)
- Fix it should have audio in case hold then transfer attended (issue 736 reopen)
- Fix android it should navigate back after kill app during a call instead of showing loading screen (issue 729)

#### 2.12.4

- Fix android multiple calls it should back to call screen after ending an outgoing call (issue 748)
- Fix it should leave group chat without any error (issue 746)
- Fix camera image picker should work after upgrading version (issue 738)
- Fix android PN screen mute button should update accordingly (issue 737)
- Fix ios transfer attend no voice (issue 736)

#### 2.12.3

- Fix android some issues related to permission (issue 725, 727, 728, 731)
- Fix it should display keyboard correctly (issue 732)

#### 2.12.2

- Fix ios it should not disconnect the other call after select a background call (issue 535)
- Fix android incoming call auto disconnect when app killed (issue 710)
- Fix android 12 loud speaker and permission after upgrading packages

#### 2.12.1

- Upgrade all packages and dependencies
- Verify ios after upgrading packages: issues no audio in case of multiple calls, previously using hacky toggle speaker, now has been fixed properly (issue 416 452 554 591 644 662 673 681 682)

#### 2.12.0

- Fix it should hide keyboard to prevent layout break whenever navigate to page call manage screen (issue 680)
- Fix it should handle group chat or invitation well when press on the notification (issue 679)
- Fix it should also re-login UC if press on the error message in case signed in from another location (issue 688)
- Fix android it should show missed call notification in case display name contain % character (issue 690)
- Fix android it should hide hangup button if the call is on hold (issue 692)
- Embed:
  - Try to fix call object field pbx talker id empty in some cases

#### 2.11.21

- Fix android it should display page call manage screen after cancel transfer (issue 689)
- Embed:
  - Fix revert mobx toJS change

#### 2.11.20

- Fix android PN screen should work correctly if answer the call on app screen
- Embed:
  - Rename params: auto_login -> autoLogin, clear_existing_accounts -> clearExistingAccounts
  - Change the way to listen on pal events using a new param: palEvents

#### 2.11.19

- Fix it should display correctly PN screen new incoming call on top of the current call
- Fix button Start Parking should not be clickable when parked
- Fix input label PHONEBOOK should update on language change

#### 2.11.18

- Fix multi calls it should not hold immediately on new call
- Fix it should show correct park name after delete
- Fix it should be able to change new park after blur the field

#### 2.11.17

- Fix android it should not display multiple PN screens in task manager
- Fix android it should be able to toggle call buttons after toggle video call
- Fix it should not reload avatar on video call toggle
- Fix it should reconnect automatically on failure
- Fix it should display the long name well in call bar
- Fix it should load phonebook after each login to display the name in call transfer

#### 2.11.16

- Update jsonrpc.js
- Add missing ja translations
- Fix it should play ding sound correctly on UC chat notification
- Fix it should reconnect on internet access being restored
- Fix android it should stop ringing on app kill
- Fix android it should reject call on app kill, then switch well between multiple PN calls

#### 2.11.15

- Fix ios press on chat notification should navigate to the correct screen
- Fix recent calls should display correct name from pbx phonebook contacts
- Fix it should prevent making an outgoing call if sip is not connected yet
- Fix android the keyboard should work correctly
- Fix it should navigate to the correct call if making an outgoing call while having another call
- Fix android loud speaker not working in some cases, only fixed in android 11 and below, for android 12 and above we will fix it in the next build 2.12.x
- Fix avatar should keep consistent state using React key render
- Embed:
  - Emit pal instance before the login to allow listening on notify_serverstatus and more other pal events

#### 2.11.14

- Try fix ios: change timeout for hacky toggle speaker to get from getProductInfo webphone.hacky.speaker otherwise default 500ms

#### 2.11.13

- Fix it should not show missed call notification if callee reject the call, known issues:
  - ios: while having an incoming brekeke phone call, if another incoming gsm call come, it will end brekeke phone call without showing notification
- Try fix ios: change timeout for hacky toggle speaker from 500ms to 850ms

#### 2.11.12

- Fix after restart server, it should show connecting state and reconnect
- Fix small screen device, it should display the call UI more properly

#### 2.11.11

- Fix android case PN-off it should vibrate ring correctly
- Fix page call transfer it should have search functionality
- Fix PN-off incoming call notify it should show number of other incoming calls
- Fix ios it should have audio in some cases with multiple calls, using hacky toggle speaker

#### 2.11.10

- Fix bug it should compare pbx versions correctly
- Disable non-tls or plain http connection for lpc and avatar image html
- Save getProductInfo webphone.useragent to local storage and use it in the next sip login
- Save getProductInfo webphone.pn_expires to local storage and use it in the next incoming PN to check if the pn expired. If it is not present, use 50000 as default 50 seconds
- Update call buttons via sip header X-WEBPHONE-CALL. The config will be merged one by one each time it receives
- Update jsonrpc.js to fix bug it should show error if pal login failed

#### 2.11.9

- Try fix bug can not logout, due to corrupted data in that phone local storage
- Allow to download debug log without logout
- Embed:
  - When unhold a call then set that call as the current call (also included in the main build)

#### 2.11.8

- Disable hangup button when pbx config webphone.call.hangup = false
- Fix android PN screen webview can not load http image: allow http clear text traffic
- Update ios lpc config:
  - Use config from pbx getProductInfo: webphone.lpc.{port,wifi,keyhash,pn}
  - If webphone.lpc.port is present, which mean lpc is enabled. Otherwise if lpc is disabled, all other lpc config will be ignored
  - If webphone.lpc.wifi is present, it will be split by comma. If it is not present, the current connected wifi will be used for lpc
  - If webphone.lpc.keyhash is present, which mean tls is enabled. The key hash will be supplied to establish tls connection
  - If webphone.lpc.pn is true, it will enable both lpc and regular pn at the same time, otherwise it will disable regular pn and use only lpc
- Use new pnmanage pal command for pbx version 3.14.5 and above, backward compatibility for lower versions

#### 2.11.7

- Keep avatar webview html/js state for outgoing calls or incoming calls without PN
- Fix android PN screen avatar webview should not keep connection

#### 2.11.6

- Use PN screen for incoming call so it will keep html/js state in avatar
- Use `-` as the tenant if it is empty
- Keep the sip token to reuse until expired after 90 seconds

#### 2.11.5

- Handle chat message ios LPC PN
- Handle avatar as html url using webview
- Fix `__DEV__` is not defined on web browser

#### 2.11.4

- Merge ios lpc into master
- Desktop notification
- Fix ios should not logout when app is in background
- Hide buttons using data from getProductInfo
- Display park label instead of number in other screens
- Fix ios RBT bug never stop
- Improve phonebook: remove toggle shared, add icon (s) for shared, fix checkbox keep displaying after finish deleting, use dislay_name
- Fix recording status using notify_callrecording
- Fix android avatar still shows when video call
- Embed:
  - Allow to get the raw session object which can get the header on call events. The object should be available for all the events: new call, call updated, call ended. See in the example `c.rawSession.incomingMessage.getHeader('X-PBX-Session-Info')`
  - Fix bug: should assign pal params before sign in
  - Fix bug: should parse pal params correctly stripe out 'webphone.pal.param.'
  - Fix bug: should move the `emit('pal')` to the bottom
  - Add more fields to the account option for login: phoneIndex, ucDisplayOfflineUsers, pushNotification. See the example for more detail on typing and default value. The other 2 options: uc, parks are already included in the previous version

#### 2.11.3

- Embed:
  - Allow to set pal params
  - Allow to set sip headers with makeCall
  - Re-initialize / restart the instance
  - Access webrtcclient instance, with inner sip instance

#### 2.11.1

- Save webphone.pal.param.user to local storage and reconnect if mismatch
- Add some more space to Keypad with the call green button
- Add dropdown to start voice/video call from screen user chat detail. For screen group chat detail, they were added already in the past
- Fix: should not show "No Account" although it has
- Improve: should not logout when app is in background or killed (android/ios), it should re-login automatically every time user open the app, unless:
  - user pressed log out intentionally in the last session
  - or a new version installed
  - or the OS restarted
  - or the app wake in background by push or by linking url
- Handle PN data x_autoanswer:
  - Only answer automatically if there is no other ongoing call
  - android: working in most of cases: foreground, lock, kill, background. In some background case like press home button, although answer action was fired but it failed to connect to SIP server occasionally
  - ios: only worked if app is foreground. Due to security privacy policy from Apple, it is difficult for us to automatically answer the call
- Update logic of phonebook contact using phonebook.js
- Display call duration in screen call detail
- Fix loud speaker RBT for ios
- Switch back/front camera in video call
- Update park logic to correctly listen on events

#### 2.10.9

- Fix RBT low volume after a call
- Embed: fix autoLogin logic

#### 2.10.8

- Android: try to fix loud speaker is not showing correctly as UI in a rare case with RBT. Currently fix using hacky timeout 2000ms. Need to check the library incall-manager and merge their latest change to see if they fixed it in a correct way not hacky
- ios: fix the issue with proximity sensor still works after end call
- Fix text style callee name or caller name is cut off sometimes if too long
- Fix avatar placeholder in case of no photo not showing on the browser
- Do not use avatar UC url if UC is disabled
- Do not send random parameter when get avatar url, in combination with a fix on server
- Do not show error when failed to get appstore version
- Update label DTMF -> KEYPAD

#### 2.10.7

- Fix avatar: remove cache, add loading, error

#### 2.10.6

- Fix 571: speaker on immediately after make a call does not work
- Fix 572: speaker on does not affect when change from ringing to talking
- Fix css icon text position change on length
- Embed: merge into the main bundle

#### 2.10.3

- Reduce console error, use log instead for debug purpose
- Some fixes remove PN token via sip header
- Some fixes UC chat image url resolver
- Allow loud speaker on early media
- Fix issue ios no audio on early media

#### 2.10.2

- Remove user=\* in pal construction
- Remove PN token via sip header if no account match

#### 2.10.1

- Fix 547: UC chat display name empty in some case
- Fix 548: UC chat should not play sound + vibration in background
- Fix 532: UC chat group name buddy list incorrect
- Fix 537: UC chat send big file cause app crash
- Fix 544 545: Fix retry login too frequently
- Early media SDP handling
- Show controls & keypad in outgoing call before answered/connected
- Fix 456 533: Incorrect hold current call
- Fix 481: Should not play both ring tone of Brekeke Phone and device
- Fix 529: Clear notification badge number when open screen recent calls
- Fix 494: Message alert should not play sound or vibrate when talking
- Show avatar in incoming/outbound/manage call using x-image
- Handle PN canceled somewhere else SIP header
- Fix 492 493 494 495 499 500 528ios: Various minor UC chat bugs
- Fix sometimes can not logout, app stuck
- Fix sometimes can not login, white screen
- Embed: init api as a separated bundle

#### 2.9.10

- Fix: send file UC chat should work correctly
- Fix: contact display name not correct

#### 2.9.8

- Enhancement for PBX buddy list

#### 2.9.2

- Implement PBX buddy list
- Handle canceled PN call completed elsewhere: do not add history
- Trim html on UC message render
- Fix: android 10 rare case ringtone can not stop
- Fix: PN switch enable take long time
- Fix: bug chat scroll to end on new message
- Web: Try trigger audio permission on OK press so it can play ringtone even window minimized

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
- Update missed call notification: title={{name || number}} body="Missed call"

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
- Insert call history for canceled PN calls
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
