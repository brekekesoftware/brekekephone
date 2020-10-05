package com.brekeke.phonedev;

import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import javax.annotation.Nonnull;

class IncomingCallModule extends ReactContextBaseJavaModule {
  static String PN_UUID = "00000000-0000-0000-0000-000000000000";
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
    this.closeIncomingCallActivity();
    Intent i = new Intent(getReactApplicationContext(), IncomingCallActivity.class);
    i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    i.putExtra("uuid", uuid);
    i.putExtra("callerName", callerName);
    i.putExtra("isVideoCall", isVideoCall);
    (getReactApplicationContext()).startActivity(i);
  }

  @ReactMethod
  void closeIncomingCallActivity() {
    if (IncomingCallModule.activity == null) {
      return;
    }
    IncomingCallModule.activity.closeIncomingCallActivity();
    IncomingCallModule.activity = null;
  }
}
