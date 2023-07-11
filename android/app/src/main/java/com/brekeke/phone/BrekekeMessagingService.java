package com.brekeke.phone;

import android.util.Log;
import com.evollu.react.fcm.FIRMessagingModule;
import com.evollu.react.fcm.MessagingService;
import com.evollu.react.fcm.ReactNativeJson;
import com.facebook.react.bridge.Promise;
import com.google.firebase.messaging.RemoteMessage;
import java.util.ArrayList;
import org.json.JSONArray;

public class BrekekeMessagingService extends MessagingService {
  private static String TAG = "BrekekeMessagingService";
  private static boolean alreadyGetInitialNotifications = false;
  private static ArrayList<String> initialNotifications = null;

  public static void getInitialNotifications(Promise promise) {
    alreadyGetInitialNotifications = true;
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
      Log.d(TAG, "getInitialNotifications" + e.getMessage());
      e.printStackTrace();
    }
  }

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    BrekekeUtils.onFcmMessageReceived(this, remoteMessage.getData());

    if (!alreadyGetInitialNotifications) {
      if (initialNotifications == null) {
        initialNotifications = new ArrayList<String>();
      }
      try {
        initialNotifications.add(
            ReactNativeJson.convertMapToJson(FIRMessagingModule.parseParams(remoteMessage))
                .toString());
      } catch (Exception e) {
        Log.d(TAG, "initialNotifications.add: " + e.getMessage());
        e.printStackTrace();
      }
    }

    super.onMessageReceived(remoteMessage);
  }
}
