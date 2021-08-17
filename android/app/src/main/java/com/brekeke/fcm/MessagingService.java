package com.brekeke.fcm;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import com.brekeke.phonedev.IncomingCallModule;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContext;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.ArrayList;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class MessagingService extends FirebaseMessagingService {
  private static String TAG = "MessagingService";

  // Fork: fix bug initial notifications on killed (legacy)
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
    // Fork: wake lock and show incoming call
    IncomingCallModule.onFcmMessageReceived(this, remoteMessage.getData());

    // Fork: fix bug initial notifications on killed (legacy)
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

    Log.d(TAG, "Remote message received");
    Intent message = new Intent("com.brekeke.fcm.ReceiveNotification");
    message.putExtra("data", remoteMessage);
    handleBadge(remoteMessage);
    buildLocalNotification(remoteMessage);

    // We need to run this on the main thread, as the React code assumes that is true.
    // Namely, DevServerHelper constructs a Handler() without a Looper, which triggers:
    // "Can't create handler inside thread that has not called Looper.prepare()"
    Handler handler = new Handler(Looper.getMainLooper());
    handler.post(
        new Runnable() {
          public void run() {
            // Construct and load our normal React JS code bundle
            ReactInstanceManager mReactInstanceManager =
                ((ReactApplication) getApplication())
                    .getReactNativeHost()
                    .getReactInstanceManager();
            ReactContext context = mReactInstanceManager.getCurrentReactContext();
            // If it's constructed, send a notification
            if (context != null) {
              LocalBroadcastManager.getInstance(context).sendBroadcast(message);
            } else {
              // Otherwise wait for construction, then send the notification
              mReactInstanceManager.addReactInstanceEventListener(
                  new ReactInstanceManager.ReactInstanceEventListener() {
                    public void onReactContextInitialized(ReactContext context) {
                      LocalBroadcastManager.getInstance(context).sendBroadcast(message);
                    }
                  });
              if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
                // Construct it in the background
                mReactInstanceManager.createReactContextInBackground();
              }
            }
          }
        });
  }

  public void handleBadge(RemoteMessage remoteMessage) {
    BadgeHelper badgeHelper = new BadgeHelper(this);
    if (remoteMessage.getData() == null) {
      return;
    }

    Map data = remoteMessage.getData();
    if (data.get("badge") == null) {
      return;
    }

    try {
      int badgeCount = Integer.parseInt((String) data.get("badge"));
      badgeHelper.setBadgeCount(badgeCount);
    } catch (Exception e) {
      Log.e(TAG, "Badge count needs to be an integer", e);
    }
  }

  public void buildLocalNotification(RemoteMessage remoteMessage) {
    if (remoteMessage.getData() == null) {
      return;
    }
    Map<String, String> data = remoteMessage.getData();
    String customNotification = data.get("custom_notification");
    if (customNotification != null) {
      try {
        Bundle bundle = BundleJSONConverter.convertToBundle(new JSONObject(customNotification));
        FIRLocalMessagingHelper helper = new FIRLocalMessagingHelper(this.getApplication());
        helper.sendNotification(bundle);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }
}
