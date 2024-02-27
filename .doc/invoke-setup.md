# Invoke setup for Android

## The target

- Can allow other apps invoke to this app, receive data, and have UI handle the flow calls with that data.

## 1. Enable deep links and add an intent filter for incoming links

In `AndroidManifest.xml` file, add `<intent-filter>` tag contains these elements and attribute values:

- `<action>`: This tag is used to point out which action will trigger an Intent. We will use `android.intent.action.VIEW` to define an action to view app.
- `<category>`: A string containing additional information about the kind of component that should handle the intent. We will use `android.intent.category.DEFAULT` to receive implicit intents.
- `<data>`: This tag provide attributes to define type of data of a URI. We will use `android:scheme` and `android:host` to define. The final URI will have the format: `<scheme>://<host>`, it is used with `Linking`.

You can see more about intents filters at:

- https://developer.android.com/guide/components/intents-filters
- https://developer.android.com/training/app-links/deep-linking

## 2. Invoke this app from another app

We will use `Linking` of React Native to handle.

- Use `Linking.canOpenURL(url)` to check URL can be handled. If it return `true`, you can invoke app with the `url`.
- Use ``Linking.openUrl(`brekekeapp_phonedev:open?${params}`)`` to invoke this app, in which:
  - The `brekekeapp_phonedev` is the attribute `android:scheme` in tag `<data>` in `Androidmanifest.xml` file.
  - The `open` is the attribute `android:host` in tag `<data>` in `Androidmanifest.xml` file.
  - The variable `params` is data stringtify by `qs.stringify()` to send to this app you need.

## 3. Handling Deep Links to receive data from another app

- Use `Linking.addEventListener('url', callback)` when the app is foregrounded, the app is already open to get data from `callback`.
- Use `Linking.getInitialURL()` when app is not already open.
- Use `qs.parse()` to parse params from the `url`.
- All of the above has been written in function `getUrlParams()` in `deeplink.ts` file.
- After parsing data, use it to handle the flow you need.

You can see all about `Linking` at https://reactnative.dev/docs/linking

## 4. About UI when invoked

- We will have 3 main screens for this:
- `Call UI`: When the app is invoked, will show this screen and have the keypad allow type numbers to call.
- `Incoming call UI`: Have info from incoming calls, allow 2 actions `Answer` or `Denial`.
- `In call UI`: Have info in the call, allow action end call.
