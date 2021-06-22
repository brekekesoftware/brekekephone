package com.brekeke.phonedev;

import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;

public class IncomingCallModule extends ReactContextBaseJavaModule {
  public static RCTDeviceEventEmitter eventEmitter = null;

  public static void emit(String name, String data) {
    eventEmitter.emit(name, data);
  }

  public static ReactApplicationContext ctx;
  public static Boolean firstShowCallAppActive = false;

  public static void tryBackToBackground() {
    try {
      if (!IncomingCallModule.firstShowCallAppActive) {
        IncomingCallModule.ctx.getCurrentActivity().moveTaskToBack(true);
      }
    } catch (Exception e) {
    }
  }

  public static IncomingCallActivityManager mgr = new IncomingCallActivityManager();

  public ReactApplicationContext reactContext;

  IncomingCallModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    IncomingCallModule.ctx = reactContext;
  }

  @Override
  public void initialize() {
    super.initialize();
    eventEmitter = reactContext.getJSModule(RCTDeviceEventEmitter.class);
  }

  @Override
  public String getName() {
    return "IncomingCall";
  }

  @ReactMethod
  public void showCall(String uuid, String callerName, Boolean isVideoCall, Boolean isAppActive) {
    Intent i;
    IncomingCallActivity prev = mgr.last();
    if (prev == null) {
      i = new Intent(reactContext, IncomingCallActivity.class);
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
      reactContext.startActivity(i);
    } else {
      prev.startActivity(i);
    }
  }

  @ReactMethod
  public void closeIncomingCallActivity(String uuid) {
    try {
      mgr.at(uuid).closeIncomingCallActivity(false);
    } catch (Exception e) {
    }
  }

  @ReactMethod
  public void closeAllIncomingCallActivities() {
    mgr.removeAll();
  }

  @ReactMethod
  public void setOnHold(String uuid, Boolean holding) {
    try {
      mgr.at(uuid).updateBtnHoldUI(holding);
    } catch (Exception e) {
    }
  }
}
