/\*\*

- Why we store the ringtone filename both in JavaScript (AsyncStorage) and in Native (SharedPreferences):
-
- - The ringtone setting is selected and changed by the user inside the JS app,
- so it makes sense to store it in AsyncStorage for easy access during UI rendering.
-
- - However, incoming calls are handled by native code (Java,
- and the JS runtime may not be initialized or available at that moment.
- This means we cannot rely on AsyncStorage to retrieve the ringtone name during call handling.
-
- By syncing the ringtone setting to SharedPreferences from JS whenever it changes,
- we ensure that native code has immediate access to the correct ringtone configuration
- without waiting for JS to load.
-
- In short:
-     - JS → for UI and local state
-     - Native → for real-time call handling via push notifications
  \*/
