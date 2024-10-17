package com.brekeke.phonedev.push_notification;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

import android.util.Log;
import com.brekeke.phonedev.BrekekeUtils;
import com.brekeke.phonedev.IncomingCallActivity;
import com.brekeke.phonedev.lpc.LpcUtilities;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Promise;
import com.google.firebase.messaging.RemoteMessage;
import com.wix.reactnativenotifications.fcm.FcmInstanceIdListenerService;
import java.util.ArrayList;
import org.json.JSONArray;

// custom push notification
public class BrekekeMessagingService extends FcmInstanceIdListenerService {
  private static String TAG = "BrekekeMessagingService";
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
    ReactApplication r = (ReactApplication) this.getApplication();
    Log.d(TAG, "onMessageReceived: " + LpcUtilities.convertMapToString(remoteMessage.getData()));
    BrekekeUtils.onFcmMessageReceived(this, remoteMessage.getData());
    Log.d(IncomingCallActivity.TAG, "Incoming call started by PN");
    if (initialNotifications == null) {
      initialNotifications = new ArrayList<String>();
    }
    try {
      initialNotifications.add(
          ReactNativeJson.convertMapToJson(BrekekeUtils.parseParams(remoteMessage)).toString());
    } catch (Exception e) {
      Log.e(TAG, "initialNotifications.add exception: " + e);
    }

    super.onMessageReceived(remoteMessage);
    //fix [Crash] Android - AssertionException: Expected to run on UI thread
    runOnUiThread(new Runnable() {
      @Override
      public void run() {
        LpcUtilities.createReactContextInBackground(r);
      }
    });

  }
}
