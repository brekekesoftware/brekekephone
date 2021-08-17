#### 2.8.32

- Android improve PN's wakeup time
- Android PN screen (device locked) if user pressed answer but call is still not connected, then show a message `Connecting...` with loading icon
- Android PN screen add multi lingual locale
- SIP add some logic to jssip fork to disable web socket send after calling \_ua.\_transport.socket.disconnect() then also call stopWebRTC() - not sure if this change actually improves the connection, please test
- Android fix sometimes PN not received in js code, because of the fcm lib
- Some other small improvements and dependencies update

#### 2.8.30

- Android show timestamp as soon as PN received. For debug purpose, first step of speeding up wake time for PN screen. This is on dev version only and will be migrated/removed when we completely done with speeding up
- Fix call can not be connected (PN token get flushed mistakenly)
- Android fix call can not be connected or dropped after connected for a while (by adding wake lock)
- Fix current call become on hold after end a background call
- Android fix bug PN screen never disappear in a case of multiple incoming calls
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
