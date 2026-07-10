### Brekeke Phone Embed - Example React

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Extract web version brekeke_phone3.0.0.zip to public folder

```
npm i
npm start
```

The left panel includes an OC MFA simulator:

1. Fill PBX/account/password/IP fields.
2. Click `OC mfa/start`, enter OTP, then click `OC mfa/check + device_token/create`.
3. The returned token is filled into `Device token`; click `setDeviceToken` to sync the Webphone account from the form and test the embed API.
4. Click `Inspect saved token` to confirm whether the local `palParams.device_token` was saved or cleared.
