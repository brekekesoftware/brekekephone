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
import java.util.HashMap;
import java.util.Map;

public class IncomingCallModule extends ReactContextBaseJavaModule {
  // [callkeepUuid] -> answerCall/rejectCall
  public static Map<String, String> userActions = new HashMap<String, String>();

  @ReactMethod
  public void getPendingUserAction(String uuid, Promise p) {
    p.resolve(userActions.get(uuid));
  }

  public static void onFcmKilled(FirebaseMessagingService fcm, Map<String, String> data) {
    String uuid = data.get("callkeepUuid");
    String callerName = data.get("x_from").toString();
    showCallStatic(fcm, uuid, callerName, false, false);
  }

  public static RCTDeviceEventEmitter eventEmitter;

  public static void emit(String name, String data) {
    try {
      eventEmitter.emit(name, data);
    } catch (Exception ex) {
    }
  }

  public static Activity main;
  public static ReactApplicationContext ctx;
  public static KeyguardManager km;
  public static boolean firstShowCallAppActive = false;
  public static IncomingCallActivityManager mgr = new IncomingCallActivityManager();

  public static void tryExitClearTask() {
    if (!mgr.activities.isEmpty()) {
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

  IncomingCallModule(ReactApplicationContext c) {
    super(c);
    ctx = c;
    if (km == null) {
      km = ((KeyguardManager) c.getSystemService(Context.KEYGUARD_SERVICE));
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

  @ReactMethod
  public void showCall(String uuid, String callerName, boolean isVideoCall, boolean isAppActive) {
    showCallStatic(null, uuid, callerName, isVideoCall, isAppActive);
  }

  public static void showCallStatic(
      FirebaseMessagingService fcm,
      String uuid,
      String callerName,
      boolean isVideoCall,
      boolean isAppActive) {
    mgr.activitiesSize++;
    Intent i;
    IncomingCallActivity prev = mgr.last();
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
    i.putExtra("isVideoCall", isVideoCall);
    if (prev != null) {
      prev.startActivity(i);
    } else if (fcm != null) {
      fcm.startActivity(i);
    } else {
      ctx.startActivity(i);
    }
  }

  @ReactMethod
  public void closeIncomingCallActivity(String uuid) {
    try {
      mgr.at(uuid).answered = false;
      mgr.remove(uuid);
    } catch (Exception e) {
    }
  }

  @ReactMethod
  public void closeAllIncomingCallActivities() {
    mgr.removeAll();
  }

  @ReactMethod
  public void setOnHold(String uuid, boolean holding) {
    try {
      mgr.at(uuid).uiSetBtnHold(holding);
    } catch (Exception e) {
    }
  }

  @ReactMethod
  public void onConnectingCallSuccess(String uuid) {
    try {
      mgr.at(uuid).onAnswerButLocked();
    } catch (Exception e) {
    }
  }

  @ReactMethod
  public void setBackgroundCalls(int n) {
    mgr.setBackgroundCalls(n);
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
