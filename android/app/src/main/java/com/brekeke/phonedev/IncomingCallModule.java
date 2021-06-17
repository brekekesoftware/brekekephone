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
    if (mgr.isEmpty()) {
      i = new Intent(reactContext, IncomingCallActivity.class);
      i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    } else {
      IncomingCallActivity prev = mgr.last();
      prev.forceStopRingtone();
      i = new Intent(prev, IncomingCallActivity.class);
    }

    i.putExtra("uuid", uuid);
    i.putExtra("callerName", callerName);
    i.putExtra("isVideoCall", isVideoCall);

    if (mgr.isEmpty()) {
      reactContext.startActivity(i);
    } else {
      mgr.last().startActivity(i);
    }
  }

  @ReactMethod
  void closeIncomingCallActivity(Boolean isAnswerPressed, String uuid) {
    if (mgr.isEmpty()) {
      return;
    }
    // TODO loop for each activities
    if (uuid == null) {
      if (mgr.last().closeIncomingCallActivity(isAnswerPressed)) {
        mgr.pop();
      }
    } else {
      mgr.at(uuid).closeIncomingCallActivity(isAnswerPressed);
    }
  }

  @ReactMethod
  void closeAllIncomingCallActivities() {
    mgr.finishAll();
  }

  @ReactMethod
  void setOnHold(String uuid, Boolean hold) {
    mgr.at(uuid).updateUIBtnHold(hold);
  }
}
