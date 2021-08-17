package com.brekeke.phonedev;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.PowerManager;
import android.os.PowerManager.WakeLock;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.reactnativecommunity.asyncstorage.AsyncLocalStorageUtil;
import com.reactnativecommunity.asyncstorage.ReactDatabaseSupplier;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

public class IncomingCallModule extends ReactContextBaseJavaModule {
  public static RCTDeviceEventEmitter eventEmitter;

  public static void emit(String name, String data) {
    try {
      eventEmitter.emit(name, data);
    } catch (Exception ex) {
    }
  }

  public static Activity main;
  public static ReactApplicationContext ctx;
  public static WakeLock wl;
  public static KeyguardManager km;

  public static boolean isAppActive = false;
  public static boolean isAppActiveLocked = false;
  public static boolean firstShowCallAppActive = false;

  IncomingCallModule(ReactApplicationContext c) {
    super(c);
    ctx = c;
    if (km == null) {
      km = ((KeyguardManager) c.getSystemService(Context.KEYGUARD_SERVICE));
    }
    if (wl == null) {
      PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
      wl = pm.newWakeLock(PowerManager.FULL_WAKE_LOCK, "BrekekePhone::IncomingCall");
    }
  }

  @Override
  public void initialize() {
    super.initialize();
    eventEmitter = ctx.getJSModule(RCTDeviceEventEmitter.class);
  }

  @Override
  public String getName() {
    return "IncomingCall";
  }

  // [callkeepUuid] -> answerCall/rejectCall
  public static Map<String, String> userActions = new HashMap<String, String>();

  public static void onFcmMessageReceived(FirebaseMessagingService fcm, Map<String, String> data) {
    if (data.get("x_pn-id") == null) {
      return;
    }
    // Init variables if not
    if (wl == null) {
      PowerManager pm = (PowerManager) fcm.getSystemService(Context.POWER_SERVICE);
      wl = pm.newWakeLock(PowerManager.FULL_WAKE_LOCK, "BrekekePhone::IncomingCall");
    }
    if (km == null) {
      km = ((KeyguardManager) fcm.getSystemService(Context.KEYGUARD_SERVICE));
    }
    // Read locale from async storage if not
    if (L.l == null) {
      try {
        L.l =
            AsyncLocalStorageUtil.getItemImpl(
                ReactDatabaseSupplier.getInstance(fcm.getApplicationContext())
                    .getReadableDatabase(),
                "locale");
      } catch (Exception ex) {
      }
    }
    if (L.l == null) {
      L.l = "en";
    }
    if (!L.l.equals("en") && !L.l.equals("ja")) {
      L.l = "en";
    }
    // Generate new uuid and store it to the PN bundle
    String now = new SimpleDateFormat("HH:mm:ss.SSS", Locale.getDefault()).format(new Date());
    data.put("callkeepAt", now);
    String uuid = UUID.randomUUID().toString().toUpperCase();
    data.put("callkeepUuid", uuid);
    // Show call
    if (activitiesSize == 0 && !wl.isHeld()) {
      wl.acquire();
    }
    activitiesSize++;
    Intent i;
    IncomingCallActivity prev = last();
    if (prev == null) {
      i = new Intent(fcm, IncomingCallActivity.class);
      i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      firstShowCallAppActive = isAppActive || isAppActiveLocked;
    } else {
      prev.forceStopRingtone();
      i = new Intent(prev, IncomingCallActivity.class);
    }
    i.putExtra("uuid", uuid);
    i.putExtra("callerName", data.get("x_from").toString());
    if (prev != null) {
      prev.startActivity(i);
    } else {
      fcm.startActivity(i);
    }
  }

  public static void tryExitClearTask() {
    if (!activities.isEmpty()) {
      return;
    }
    if (!firstShowCallAppActive) {
      try {
        main.moveTaskToBack(true);
      } catch (Exception e) {
      }
    }
    if (main == null) {
      Intent i = new Intent(ctx, ExitActivity.class);
      i.addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK
              | Intent.FLAG_ACTIVITY_CLEAR_TASK
              | Intent.FLAG_ACTIVITY_NO_ANIMATION
              | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
      ctx.startActivity(i);
    }
  }

  public static boolean isLocked() {
    return km.isKeyguardLocked() || km.isDeviceLocked();
  }

  //
  // IncomingCallActivityManager
  //
  public static ArrayList<IncomingCallActivity> activities = new ArrayList<IncomingCallActivity>();
  // Manually manage activities size:
  // Try to increase BEFORE contructing the intent, the above activities is add AFTER constructing
  public static int activitiesSize = 0;
  // Calls size from js
  public static int callsSize = 0;

  public static void remove(String uuid) {
    IncomingCallActivity a = at(uuid);
    if (a == null) {
      return;
    }
    try {
      activities.remove(index(uuid));
    } catch (Exception e) {
    }
    a.forceFinish();
    if (!a.answered) {
      IncomingCallModule.tryExitClearTask();
    }
  }

  public static void removeAll() {
    if (activities.size() <= 0) {
      return;
    }
    boolean atLeastOneAnswerPressed = false;
    try {
      for (IncomingCallActivity a : activities) {
        atLeastOneAnswerPressed = atLeastOneAnswerPressed || a.answered;
        a.forceFinish();
      }
      activities.clear();
    } catch (Exception e) {
    }
    if (!atLeastOneAnswerPressed) {
      IncomingCallModule.tryExitClearTask();
    }
  }

  public static void removeAllAndBackToForeground() {
    removeAll();
    IncomingCallModule.emit("backToForeground", "");
  }

  public static IncomingCallActivity at(String uuid) {
    for (IncomingCallActivity a : activities) {
      if (a.uuid.equals(uuid)) {
        return a;
      }
    }
    return null;
  }

  public static IncomingCallActivity last() {
    try {
      return activities.get(activities.size() - 1);
    } catch (Exception e) {
      return null;
    }
  }

  public static int index(String uuid) {
    int i = 0;
    for (IncomingCallActivity a : activities) {
      if (a.uuid.equals(uuid)) {
        return i;
      }
      i++;
    }
    return -1;
  }

  // To open app when:
  // - call is answered and
  // - on pause (click home when locked) or destroy (click answer when forground)
  // TODO handle case multiple calls
  public static void onActivityPauseOrDestroy() {
    if (activitiesSize > 1) {
      return;
    }
    if (IncomingCallModule.wl.isHeld()) {
      IncomingCallModule.wl.release();
    }
    try {
      if (last().answered) {
        removeAllAndBackToForeground();
      }
    } catch (Exception e) {
    }
    updateBtnUnlockLabels();
  }

  public static void updateBtnUnlockLabels() {
    try {
      for (IncomingCallActivity a : activities) {
        try {
          a.updateBtnUnlockLabel();
        } catch (Exception e) {
        }
      }
    } catch (Exception e) {
    }
  }

  //
  // React methods
  //

  @ReactMethod
  public void setLocale(String locale) {
    L.l = locale;
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              for (IncomingCallActivity a : activities) {
                try {
                  a.updateLabels();
                } catch (Exception e) {
                }
              }
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setIsAppActive(boolean b1, boolean b2) {
    isAppActive = b1;
    isAppActiveLocked = b2;
  }

  @ReactMethod
  public void getPendingUserAction(String uuid, Promise p) {
    p.resolve(userActions.get(uuid));
  }

  @ReactMethod
  public void onConnectingCallSuccess(String uuid) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).onConnectingCallSuccess();
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void closeIncomingCallActivity(String uuid) {
    try {
      at(uuid).answered = false;
      remove(uuid);
    } catch (Exception e) {
    }
  }

  @ReactMethod
  public void closeAllIncomingCallActivities() {
    removeAll();
  }

  @ReactMethod
  public void setIsVideoCall(String uuid, boolean isVideoCall) {
    try {
      at(uuid).setBtnVideoSelected(isVideoCall);
    } catch (Exception e) {
    }
  }

  @ReactMethod
  public void setOnHold(String uuid, boolean holding) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setBtnHoldSelected(holding);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setBackgroundCalls(int n) {
    callsSize = n;
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            updateBtnUnlockLabels();
          }
        });
  }

  @ReactMethod
  public void isLocked(Promise p) {
    p.resolve(isLocked());
  }

  @ReactMethod
  public void backToBackground() {
    try {
      main.moveTaskToBack(true);
    } catch (Exception e) {
    }
  }
}
