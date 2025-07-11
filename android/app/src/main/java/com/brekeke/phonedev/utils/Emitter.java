package com.brekeke.phonedev.utils;

import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;

public class Emitter {
  private static RCTDeviceEventEmitter ee;

  public static void init() {
    if (ee != null) {
      return;
    }
    var ctx = Ctx.rn();
    if (ctx == null) {
      return;
    }
    try {
      ee = ctx.getJSModule(RCTDeviceEventEmitter.class);
    } catch (Exception e) {
    }
  }

  public static boolean emit(String k, String d) {
    try {
      ee.emit(k, d);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  public static boolean debug(String d) {
    return emit("debug", d);
  }

  public static boolean error(String d) {
    return emit("error", d);
  }

  public static boolean error(String k, String d) {
    return error(k + " error: " + d);
  }
}
