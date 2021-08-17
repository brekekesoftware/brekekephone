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
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import com.google.firebase.messaging.FirebaseMessagingService;
import java.util.ArrayList;
import java.util.HashMap;
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
    if (wl == null) {
      PowerManager pm = (PowerManager) fcm.getSystemService(Context.POWER_SERVICE);
      wl = pm.newWakeLock(PowerManager.FULL_WAKE_LOCK, "BrekekePhone::IncomingCall");
    }
    if (km == null) {
      km = ((KeyguardManager) fcm.getSystemService(Context.KEYGUARD_SERVICE));
    }
    String uuid = UUID.randomUUID().toString().toUpperCase();
    data.put("callkeepUuid", uuid);
    String callerName = data.get("x_from").toString();
    showCall(fcm, uuid, callerName, false);
  }

  public static void showCall(
      FirebaseMessagingService fcm, String uuid, String callerName, boolean isAppActive) {
    if (activitiesSize == 0 && !wl.isHeld()) {
      wl.acquire();
    }
    activitiesSize++;
    Intent i;
    IncomingCallActivity prev = last();
    if (prev == null) {
      i = new Intent(fcm == null ? ctx : fcm, IncomingCallActivity.class);
      i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      firstShowCallAppActive = isAppActive;
    } else {
      prev.forceStopRingtone();
      i = new Intent(prev, IncomingCallActivity.class);
    }
    i.putExtra("uuid", uuid);
    i.putExtra("callerName", callerName);
    if (prev != null) {
      prev.startActivity(i);
    } else if (fcm != null) {
      fcm.startActivity(i);
    } else {
      ctx.startActivity(i);
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
    uiSetBackgroundCalls(callsSize);
  }

  public static void uiSetBackgroundCalls(int n) {
    callsSize = n;
    try {
      for (IncomingCallActivity a : activities) {
        try {
          a.uiSetBackgroundCalls(n);
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
  public void getPendingUserAction(String uuid, Promise p) {
    p.resolve(userActions.get(uuid));
  }

  @ReactMethod
  public void onConnectingCallSuccess(String uuid) {
    try {
      at(uuid).onConnectingCallSuccess();
    } catch (Exception e) {
    }
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
      at(uuid).uiSetBtnVideo(isVideoCall);
    } catch (Exception e) {
    }
  }

  @ReactMethod
  public void setOnHold(String uuid, boolean holding) {
    try {
      at(uuid).uiSetBtnHold(holding);
    } catch (Exception e) {
    }
  }

  @ReactMethod
  public void setBackgroundCalls(int n) {
    uiSetBackgroundCalls(n);
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
