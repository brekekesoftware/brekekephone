package com.brekeke.phonedev;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;

public class IncomingCallModule extends ReactContextBaseJavaModule {
  public static RCTDeviceEventEmitter eventEmitter;

  public static void emit(String name, String data) {
    eventEmitter.emit(name, data);
  }

  public static Activity main;
  public static ReactApplicationContext ctx;
  public static boolean firstShowCallAppActive = false;

  public static void tryExitClearTask() {
    if (!firstShowCallAppActive) {
      try {
        main.moveTaskToBack(true);
      } catch (Exception e) {
      }
    }
    if (main == null) {
      ExitActivity.exitApplication(ctx);
    }
  }

  public static KeyguardManager km;

  public static boolean isLocked() {
    return km.isKeyguardLocked() || km.isDeviceLocked();
  }

  public static IncomingCallActivityManager mgr = new IncomingCallActivityManager();

  IncomingCallModule(ReactApplicationContext c) {
    super(c);
    ctx = c;
    km = ((KeyguardManager) c.getSystemService(Context.KEYGUARD_SERVICE));
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
    Intent i;
    IncomingCallActivity prev = mgr.last();
    if (prev == null) {
      i = new Intent(ctx, IncomingCallActivity.class);
      i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      firstShowCallAppActive = isAppActive;
    } else {
      prev.forceStopRingtone();
      i = new Intent(prev, IncomingCallActivity.class);
    }
    i.putExtra("uuid", uuid);
    i.putExtra("callerName", callerName);
    i.putExtra("isVideoCall", isVideoCall);

    if (prev == null) {
      ctx.startActivity(i);
    } else {
      prev.startActivity(i);
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
      mgr.at(uuid).updateBtnHoldUI(holding);
    } catch (Exception e) {
    }
  }

  @ReactMethod
  public void isLocked(Promise p) {
    p.resolve(isLocked());
  }
}
