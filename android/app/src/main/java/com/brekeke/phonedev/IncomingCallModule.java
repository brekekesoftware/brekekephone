package com.brekeke.phonedev;

import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;

class IncomingCallModule extends ReactContextBaseJavaModule {
  public static RCTDeviceEventEmitter eventEmitter = null;

  static void emit(String name, String data) {
    eventEmitter.emit(name, data);
  }

  public static IncomingCallActivityManager mgr = new IncomingCallActivityManager();

  public ReactApplicationContext reactContext;

  IncomingCallModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
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
  void showCall(String uuid, String callerName, Boolean isVideoCall) {
    Intent i;
    IncomingCallActivity prev = mgr.last();
    if (prev == null) {
      i = new Intent(reactContext, IncomingCallActivity.class);
      i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
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
  void closeIncomingCallActivity(String uuid, Boolean isAnswerPressed) {
    if (mgr.isEmpty()) {
      return;
    }
    try {
      mgr.at(uuid).closeIncomingCallActivity(isAnswerPressed);
    } catch (Exception ex) {
    }
  }

  @ReactMethod
  void closeAllIncomingCallActivities() {
    mgr.finishAll();
  }

  @ReactMethod
  void setOnHold(String uuid, Boolean holding) {
    try {
      mgr.at(uuid).updateBtnHoldUI(holding);
    } catch (Exception ex) {
    }
  }
}
