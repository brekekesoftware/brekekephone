### Custom ringtone logic:

#### Android

- When an incoming call comes, it will try each of the below with priority:
  - PN data `x_ringtone`, also the same with lpc
  - PN off then sip getHeader `X-Ringtone`
  - User-selected ringtone in account settings
  - PBX getProductInfo `webphone.call.ringtone`
  - Default
- For the list of available ringtones to select in the account settings, it can get from:
  - Pre-defined audio files
  - Ringtone from system os
- For the support of server like: `x_ringtone`, `X-Ringtone`, `webphone.call.ringtone`
  - It can be the name of the above available ringtones
  - It can be url with prefix https://
- In case of an https url, it must play in async. And if the url is not a valid audio or error, it could result in some silent delay before trying the next priority

#### iOS

- TODO:

#### Web browser

- The logic should be similar to android except:
  - No ringtone from system os
  - No PN data
