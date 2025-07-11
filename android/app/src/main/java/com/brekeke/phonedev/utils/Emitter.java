package com.brekeke.phonedev.utils;

import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;

public class Emitter {
  private static RCTDeviceEventEmitter ee;

  public static void init() {
    if (ee != null) {
      return;
    }
    var c = Ctx.main();
    if (c == null) {
      return;
    }
    try {
      ee = c.getJSModule(RCTDeviceEventEmitter.class);
    } catch (Exception e) {
    }
  }

  public static boolean debug(String data) {
    return emit("debug", data);
  }

  public static boolean emit(String name, String data) {
    try {
      ee.emit(name, data);
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
