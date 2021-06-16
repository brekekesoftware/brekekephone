package com.brekeke.phonedev;

import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;

import java.util.ArrayList;

class IncomingCallModule extends ReactContextBaseJavaModule {
  private static RCTDeviceEventEmitter eventEmitter = null;

  static void emit(String name, String data) {
    eventEmitter.emit(name, data);
  }
  public static ArrayList<IncomingCallActivity> incomingCallActivities = new ArrayList<IncomingCallActivity>();

  private ReactApplicationContext reactContext;

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
    Log.d("DEV", "showCall:request_code:: "+ incomingCallActivities.size());
    if (incomingCallActivities.size() == 0) {
      Intent i = new Intent(reactContext, IncomingCallActivity.class);
      i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      i.putExtra("uuid", uuid);
      i.putExtra("callerName", callerName);
      i.putExtra("isVideoCall", isVideoCall);
      reactContext.startActivity(i);
    }else{
      incomingCallActivities.get(incomingCallActivities.size() - 1).showOtherCall(uuid,callerName, isVideoCall);
    }
  }

  @ReactMethod
  void closeIncomingCallActivity(Boolean isAnswerPressed) {
    if (incomingCallActivities.isEmpty() == true) {
      return;
    }
    if (incomingCallActivities.get(incomingCallActivities.size()-1).closeIncomingCallActivity(isAnswerPressed)) {
      incomingCallActivities.remove(incomingCallActivities.size() -1);
    }
  }
}
