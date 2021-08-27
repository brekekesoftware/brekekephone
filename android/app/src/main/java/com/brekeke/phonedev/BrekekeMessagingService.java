package com.brekeke.phonedev;

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
  private static Boolean alreadyGetInitialNotifications = false;
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
    } catch (Exception ex) {
      promise.resolve(null);
      Log.d(TAG, "getInitialNotifications" + ex.getMessage());
      ex.printStackTrace();
    }
  }

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    BrekekeModule.onFcmMessageReceived(this, remoteMessage.getData());

    if (!alreadyGetInitialNotifications) {
      if (initialNotifications == null) {
        initialNotifications = new ArrayList<String>();
      }
      try {
        initialNotifications.add(
            ReactNativeJson.convertMapToJson(FIRMessagingModule.parseParams(remoteMessage))
                .toString());
      } catch (Exception ex) {
        Log.d(TAG, "initialNotifications.add: " + ex.getMessage());
        ex.printStackTrace();
      }
    }

    super.onMessageReceived(remoteMessage);
  }
}
