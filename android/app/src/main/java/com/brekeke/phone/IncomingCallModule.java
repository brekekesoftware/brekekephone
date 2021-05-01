package com.brekeke.phone;

import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import javax.annotation.Nonnull;

class IncomingCallModule extends ReactContextBaseJavaModule {
  private static RCTDeviceEventEmitter eventEmitter = null;

  static void emit(String name, String data) {
    eventEmitter.emit(name, data);
  }

  static IncomingCallActivity activity;
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
  void showCall(@Nonnull String uuid, @Nonnull String callerName, @Nonnull Boolean isVideoCall) {
    closeIncomingCallActivity(false); // Close the current PN screen if any
    Intent i = new Intent(reactContext, IncomingCallActivity.class);
    i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    i.putExtra("uuid", uuid);
    i.putExtra("callerName", callerName);
    i.putExtra("isVideoCall", isVideoCall);
    reactContext.startActivity(i);
  }

  @ReactMethod
  void closeIncomingCallActivity(Boolean isAnswerPressed) {
    if (IncomingCallModule.activity == null) {
      return;
    }
    if (IncomingCallModule.activity.closeIncomingCallActivity(isAnswerPressed)) {
      IncomingCallModule.activity = null;
    }
  }
}
