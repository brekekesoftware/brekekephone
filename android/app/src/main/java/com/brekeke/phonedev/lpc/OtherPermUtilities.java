package com.brekeke.phonedev.lpc;

import android.annotation.SuppressLint;
import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.text.TextUtils;
import android.util.Log;
import java.lang.reflect.Method;

// MIUI. Redefining Android.
public class OtherPermUtilities {
  private static String TAG = "[BrekekeLpcService]";
  public static final int OP_BACKGROUND_START_ACTIVITY = 10021;

  public static boolean isMIUI() {
    return !TextUtils.isEmpty(getSystemProperty("ro.miui.ui.version.name"));
  }

  @SuppressLint("PrivateApi")
  private static String getSystemProperty(String key) {
    try {
      Class props = Class.forName("android.os.SystemProperties");
      return (String) props.getMethod("get", String.class).invoke(null, key);
    } catch (Exception ignore) {
    }
    return null;
  }

  public static boolean isOtherPermissionGranted(Context context) {
    try {
      AppOpsManager mgr = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
      Method m =
          AppOpsManager.class.getMethod("checkOpNoThrow", int.class, int.class, String.class);
      int result =
          (int)
              m.invoke(
                  mgr,
                  OP_BACKGROUND_START_ACTIVITY,
                  android.os.Process.myUid(),
                  context.getPackageName());
      return result == AppOpsManager.MODE_ALLOWED;
    } catch (Exception e) {
      Log.d(TAG, "isCustomPermissionGranted: " + e.getMessage());
    }
    return true;
  }

  public static Intent getPermissionManagerIntent(Context context) {
    Intent intent = new Intent("miui.intent.action.APP_PERM_EDITOR");
    intent.putExtra("extra_package_uid", android.os.Process.myUid());
    intent.putExtra("extra_pkgname", context.getPackageName());
    intent.putExtra("extra_package_name", context.getPackageName());
    return intent;
  }
}
