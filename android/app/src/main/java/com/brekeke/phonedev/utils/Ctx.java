package com.brekeke.phonedev.utils;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import com.facebook.react.bridge.ReactApplicationContext;

// utils to manage contexts
// main react native context and push notification context are different
// on push notification wake up, the react native js might not be available yet

public class Ctx {
  private static ReactApplicationContext rn;
  private static Context main;
  private static Context pn;

  private static void setRn(ReactApplicationContext ctx) {
    if (ctx != null && rn == null) {
      rn = ctx;
    }
  }

  private static void setRn(Context ctx) {
    if (ctx != null && ctx instanceof ReactApplicationContext) {
      setRn((ReactApplicationContext) ctx);
      return;
    }
    var a = ctx.getApplicationContext();
    if (a != null && a instanceof ReactApplicationContext) {
      setRn((ReactApplicationContext) a);
      return;
    }
  }

  public static void wakeFromMainRn(Context ctx) {
    main = ctx;
    setRn(ctx);
    init();
  }

  public static void wakeFromPn(Context ctx) {
    pn = ctx;
    setRn(ctx);
    init();
  }

  public static Context app() {
    // try to prioritize main react native context
    // try to prioritize getApplicationContext
    var a1 = rn != null ? rn.getApplicationContext() : null;
    if (a1 != null) {
      return a1;
    }
    var a2 = main != null ? main.getApplicationContext() : null;
    if (a2 != null) {
      return a2;
    }
    var a3 = pn != null ? pn.getApplicationContext() : null;
    if (a3 != null) {
      return a3;
    }
    if (rn != null) {
      return rn;
    }
    if (main != null) {
      return main;
    }
    return pn;
  }

  public static ReactApplicationContext rn() {
    if (rn != null) {
      return rn;
    }
    var a = app();
    if (a != null && a instanceof ReactApplicationContext) {
      return (ReactApplicationContext) a;
    }
    return null;
  }

  private static void init() {
    // each init should check if it is already initialized or not
    // this can be helpful if some are failed to init, then they can be reinit
    L.init();
    Emitter.init();
    Ringtone.init();
  }

  public static Handler h() {
    return new Handler(Looper.getMainLooper());
  }
}
