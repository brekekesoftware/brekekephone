package com.brekeke.phonedev.utils;

import android.annotation.SuppressLint;
import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;

// main react native context and push notification context are different
// on push notification wake up, the react native js might not be available yet
public class Ctx {
  private static ReactApplicationContext rn;
  private static Context pn;
  private static Context main;
  private static boolean initialized = false;

  // This ensures that native code always has access to a valid Context, regardless of whether
  // React Native has been initialized yet or not.
  public static void wakeFromMainRn(Context ctx) {
    if (ctx instanceof ReactApplicationContext) {
      rn = (ReactApplicationContext) ctx;
    } else {
      main = ctx;
    }
    init();
  }

  public static void wakeFromPn(Context ctx) {
    // Using application context to avoid leaks
    pn = ctx.getApplicationContext();
    init();
  }

  public static Context app() {
    // try to prioritize main react native context
    var ctx = rn != null ? rn : (main != null ? main : pn);
    return ctx.getApplicationContext();
  }

  public static ReactApplicationContext rn() {
    return rn;
  }

  private static void init() {
    if (initialized) return;
    initialized = true;
    L.init();
    Ringtone.init();
  }
}
