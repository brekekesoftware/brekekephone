package com.brekeke.fcm;

import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.os.PowerManager.WakeLock;
import android.util.Log;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import com.brekeke.phonedev.IncomingCallModule;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Map;
import java.util.UUID;
import org.json.JSONException;
import org.json.JSONObject;

public class MessagingService extends FirebaseMessagingService {
  public static Boolean alreadyGetInitialNotification = false;
  public static String initialNotification = null;
  private static final String TAG = "MessagingService";

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
    final WakeLock wl = pm.newWakeLock(PowerManager.FULL_WAKE_LOCK, "BrekekePhone::FcmWakeLock");
    wl.acquire();

    if (IncomingCallModule.km == null) {
      IncomingCallModule.km = ((KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE));
    }

    final Map<String, String> data = remoteMessage.getData();
    boolean isCall = data.get("x_pn-id") != null;
    if (isCall && IncomingCallModule.main == null) {
      String uuid = UUID.randomUUID().toString().toUpperCase();
      data.put("callkeepUuid", uuid);
      IncomingCallModule.onFcmKilled(this, data);
    }

    Log.d(TAG, "Remote message received");
    Intent i = new Intent("com.brekeke.fcm.ReceiveNotification");
    i.putExtra("data", remoteMessage);
    handleBadge(remoteMessage);
    buildLocalNotification(remoteMessage);

    final Intent message = i;

    if (MessagingService.initialNotification == null
        && !MessagingService.alreadyGetInitialNotification) {
      try {
        MessagingService.initialNotification =
            ReactNativeJson.convertMapToJson(FIRMessagingModule.parseParams(remoteMessage))
                .toString();
      } catch (Exception err) {
        Log.d(TAG, "initialNotification: " + err.getMessage());
        err.printStackTrace();
      }
    }

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
              wl.release();
            } else {
              // Otherwise wait for construction, then send the notification
              mReactInstanceManager.addReactInstanceEventListener(
                  new ReactInstanceManager.ReactInstanceEventListener() {
                    public void onReactContextInitialized(ReactContext context) {
                      LocalBroadcastManager.getInstance(context).sendBroadcast(message);
                      wl.release();
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
