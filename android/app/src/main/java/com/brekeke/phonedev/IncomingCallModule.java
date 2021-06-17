package com.brekeke.phonedev;

import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import java.util.ArrayList;

class IncomingCallModule extends ReactContextBaseJavaModule {
  public static RCTDeviceEventEmitter eventEmitter = null;

  static void emit(String name, String data) {
    eventEmitter.emit(name, data);
  }

  public static IncomingCallActivityManager mgr = new IncomingCallActivityManager();
  public static ArrayList<IncomingCallActivity> activities = new ArrayList<IncomingCallActivity>();

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
    if (activities.isEmpty()) {
      i = new Intent(reactContext, IncomingCallActivity.class);
      i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    } else {
      IncomingCallActivity prev = activities.get(activities.size() - 1);
      prev.forceStopRingtone();
      i = new Intent(prev, IncomingCallActivity.class);
    }
    i.putExtra("uuid", uuid);
    i.putExtra("callerName", callerName);
    i.putExtra("isVideoCall", isVideoCall);
    if (activities.isEmpty()) {
      reactContext.startActivity(i);
    } else {
      activities.get(activities.size() - 1).startActivity(i);
    }
  }

  @ReactMethod
  void closeIncomingCallActivity(String uuid, Boolean isAnswerPressed) {
    if (activities.isEmpty()) {
      return;
    }
    // TODO loop for each activities
    if (activities.get(activities.size() - 1).closeIncomingCallActivity(isAnswerPressed)) {
      activities.remove(activities.size() - 1);
    }
  }

  @ReactMethod
  void closeAllIncomingCallActivities() {
    // TODO
  }

  @ReactMethod
  void setOnHold(String uuid, Boolean hold) {
    try {
      mgr.by(uuid).btnHold.setSelected(hold)
    } catch(Exception ex) {
    }
  }
}
