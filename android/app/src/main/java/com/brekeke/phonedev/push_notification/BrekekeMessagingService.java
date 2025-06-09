package com.brekeke.phonedev;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

import android.util.Log;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.Promise;
import com.google.firebase.messaging.RemoteMessage;
import com.wix.reactnativenotifications.fcm.FcmInstanceIdListenerService;
import java.util.ArrayList;
import org.json.JSONArray;

// custom push notification
public class BrekekeMessagingService extends FcmInstanceIdListenerService {
  private static String TAG = "[BrekekeMessagingService]";
  private static ArrayList<String> initialNotifications = null;

  public static void getInitialNotifications(Promise promise) {
    if (initialNotifications == null) {
      promise.resolve(null);
      return;
    }
    try {
      String[] arr = new String[initialNotifications.size()];
      arr = initialNotifications.toArray(arr);
      initialNotifications = null;
      promise.resolve(new JSONArray(arr).toString());
    } catch (Exception e) {
      promise.resolve(null);
      Log.e(TAG, "getInitialNotifications exception: " + e);
    }
  }

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    if (!BrekekeUtils.checkNotificationPermission(this)) {
      return;
    }
    if (!BrekekeUtils.checkReadPhonePermission(this)) {
      BrekekeUtils.emit("phonePermission", "");
      return;
    }
    // it should close the default dialer permission popup when there is an incoming call
    BrekekeUtils.resolveDefaultDialer("The call is incoming");
    BrekekeUtils.onFcmMessageReceived(this, remoteMessage.getData());

    if (initialNotifications == null) {
      initialNotifications = new ArrayList<String>();
    }
    try {
      initialNotifications.add(
          ReactNativeJson.convertMapToJson(BrekekeUtils.parseParams(remoteMessage)).toString());
    } catch (Exception e) {
      Log.e(TAG, "initialNotifications.add exception: " + e);
    }

    // Build a new RemoteMessage with the updated data for callkeepAt and callkeepUuid
    RemoteMessage newRemoteMessage =
        new RemoteMessage.Builder(remoteMessage.getFrom())
            .setMessageId(remoteMessage.getMessageId()) // Retain the original message ID
            .setTtl(remoteMessage.getTtl()) // Retain the original TTL (Time-to-Live)
            .setData(remoteMessage.getData()) // Add the updated data
            .build();

    super.onMessageReceived(newRemoteMessage);

    // android lpc
    // fix crash AssertionException: Expected to run on UI thread
    // wake up from lpc will run on a diffrent thread, need to switch to the main thread
    ReactApplication r = (ReactApplication) getApplication();
    runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            LpcUtils.createReactContextInBackground(r);
          }
        });
  }
}
