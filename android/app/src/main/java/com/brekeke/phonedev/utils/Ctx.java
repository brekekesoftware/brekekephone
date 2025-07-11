package com.brekeke.phonedev.utils;

import android.annotation.SuppressLint;
import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;

// main react native context and push notification context are different
// on push notification wake up, the react native js might not be available yet
public class Ctx {
  private static ReactApplicationContext rn;

  // Using application context to avoid memory leaks
  @SuppressLint("StaticFieldLeak")
  private static Context pn;

  @SuppressLint("StaticFieldLeak")
  private static Context main;

  private static boolean initialized = false;

  // This ensures that native code always has access to a valid Context, regardless of whether
  // React Native has been initialized yet or not.
  public static void wakeFromMainRn(Context ctx) {
    if (ctx instanceof ReactApplicationContext) {
      rn = (ReactApplicationContext) ctx;
    } else {
      main = ctx.getApplicationContext();
    }
    init();
  }

  public static void wakeFromPn(Context ctx) {
    pn = ctx.getApplicationContext();
    init();
  }

  public static Context app() {
    // try to prioritize main react native context
    return rn != null ? rn.getApplicationContext() : (main != null ? main : pn);
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
