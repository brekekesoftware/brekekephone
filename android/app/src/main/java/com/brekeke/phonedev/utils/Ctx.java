package com.brekeke.phonedev.utils;

import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;

// main react native context and push notification context are different
// on push notification wake up, the react native js might not be available yet
public class Ctx {
  private static ReactApplicationContext main;
  private static Context pn;

  public static void wakeFromMainRn(ReactApplicationContext c) {
    main = c;
    init();
  }

  public static void wakeFromPn(Context c) {
    pn = c;
    init();
  }

  public static Context app() {
    // try to prioritize main react native context
    var c = main != null ? main : pn;
    return c.getApplicationContext();
  }

  public static ReactApplicationContext main() {
    return main;
  }

  private static void init() {
    L.init();
  }
}
