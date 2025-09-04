package com.brekeke.phonedev.utils;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import com.brekeke.phonedev.lpc.LpcUtils;
import com.facebook.react.bridge.Promise;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// utils to manage permissions
// see the related part in rn js for reference

public class Perm {
  public static String Overlay = "Overlay";
  public static String IgnoringBatteryOptimizations = "IgnoringBatteryOptimizations";
  public static String AndroidLpc = "AndroidLpc";

  private interface Handler {
    boolean check();

    // return true if already open activity and wait for main activity on resume
    // it should add the promise to the pending array and wait for on resume
    // otherwise, it will resolve the promise as true immediately
    // TODO: should handle in react native on app state change and check() again
    boolean request();
  }

  private static final Map<String, Handler> handlers = new HashMap<>();

  static {
    handlers.put(
        Overlay,
        new Handler() {
          @Override
          public boolean check() {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
              return true;
            }
            var ctx = Ctx.app();
            return Settings.canDrawOverlays(ctx);
          }

          @Override
          public boolean request() {
            var ctx = Ctx.app();
            var i =
                new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + ctx.getPackageName()));
            i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(i);
            return true;
          }
        });

    handlers.put(
        IgnoringBatteryOptimizations,
        new Handler() {
          @Override
          public boolean check() {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
              return true;
            }
            var ctx = Ctx.app();
            if (ctx == null) {
              return false;
            }
            var pm = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
            return pm.isIgnoringBatteryOptimizations(ctx.getPackageName());
          }

          @Override
          public boolean request() {
            var ctx = Ctx.app();
            var i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            i.setData(Uri.parse("package:" + ctx.getPackageName()));
            i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(i);
            return true;
          }
        });

    handlers.put(
        AndroidLpc,
        new Handler() {
          private static final int OP_BACKGROUND_START_ACTIVITY = 10021;

          @Override
          public boolean check() {
            try {
              var ctx = Ctx.app();
              var mgr = (AppOpsManager) ctx.getSystemService(Context.APP_OPS_SERVICE);
              var m =
                  AppOpsManager.class.getMethod(
                      "checkOpNoThrow", int.class, int.class, String.class);
              var r =
                  (int)
                      m.invoke(
                          mgr,
                          OP_BACKGROUND_START_ACTIVITY,
                          android.os.Process.myUid(),
                          ctx.getPackageName());
              return r == AppOpsManager.MODE_ALLOWED;
            } catch (Exception e) {
              Emitter.error("AndroidLpc Permission check", e.getMessage());
            }
            return true;
          }

          @Override
          public boolean request() {
            if (LpcUtils.isMIUI()) {
              var ctx = Ctx.app();
              var i = LpcUtils.getPermissionManagerIntent(ctx);
              i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_MULTIPLE_TASK);
              ctx.startActivity(i);
              return true;
            }
            // TODO: check for other OS
            return false;
          }
        });
  }

  private static final Map<String, List<Promise>> promises = new HashMap<>();

  public static boolean check(String k) {
    var h = handlers.get(k);
    if (h == null) {
      Emitter.error("Unknown permission check: " + k);
      return false;
    }
    return h.check();
  }

  public static void request(String k, Promise p) {
    var h = handlers.get(k);
    if (h == null) {
      Emitter.error("Unknown permission request: " + k);
      p.reject("PERM_ERROR", "Unknown permission: " + k);
      return;
    }
    if (h.request()) {
      promises.computeIfAbsent(k, _k -> new ArrayList<>()).add(p);
    } else {
      p.resolve(true);
    }
  }

  public static void resolve() {
    for (var e : promises.entrySet()) {
      var k = e.getKey();
      var h = handlers.get(k);
      var granted = h.check();
      for (var p : e.getValue()) {
        p.resolve(granted);
      }
    }
    promises.clear();
  }
}
