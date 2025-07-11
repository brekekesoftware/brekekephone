package com.brekeke.phonedev.utils;

import android.annotation.SuppressLint;
import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;

// utils to manage contexts
// main react native context and push notification context are different
// on push notification wake up, the react native js might not be available yet

public class Ctx {
  private static ReactApplicationContext rn;

  private static void setRn(ReactApplicationContext ctx) {
    if (rn == null) {
      rn = ctx;
      // remove pn context to prevent leak
      pn = null;
    }
  }

  private static void setRn(Context ctx) {
    if (ctx instanceof ReactApplicationContext) {
      setRn((ReactApplicationContext) ctx);
      return;
    }
    var a = ctx.getApplicationContext();
    if (a != null && a instanceof ReactApplicationContext) {
      setRn((ReactApplicationContext) a);
    }
  }

  public static void wakeFromMainRn(Context ctx) {
    setRn(ctx);
    init();
  }

  @SuppressLint("StaticFieldLeak")
  private static Context pn;

  public static void wakeFromPn(Context ctx) {
    setRn(ctx);
    if (rn == null) {
      // only set pn context if rn context is not available yet to prevent leak
      pn = ctx;
    }
    init();
  }

  public static Context app() {
    // try to prioritize main react native context
    // try to prioritize getApplicationContext
    var rna = rn != null ? rn.getApplicationContext() : null;
    var pna = pn != null ? pn.getApplicationContext() : null;
    return rna != null ? rna : (pna != null ? pna : (rn != null ? rn : pn));
  }

  public static ReactApplicationContext rn() {
    return rn;
  }

  private static void init() {
    // each init should check if it is already initialized or not
    // this can be helpful if some are failed to init, then they can be reinit
    L.init();
    Emitter.init();
    Ringtone.init();
  }
}
