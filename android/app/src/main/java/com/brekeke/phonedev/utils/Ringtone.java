package com.brekeke.phonedev.utils;

import android.database.Cursor;
import android.media.RingtoneManager;
import android.util.Log;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import java.util.Arrays;

public class Ringtone {
  public static final String[] staticRingtones = {"incallmanager_ringtone"};
  public static final String defaultRingtone = staticRingtones[0];
  private static final String TAG = "[Ringtone]";

  public static String validateRingtone(String ringtone) {
    Log.d(TAG, "validateRingtone: " + ringtone);
    if (Arrays.asList(staticRingtones).contains(ringtone) || ringtone.contains("content://")) {
      return ringtone;
    }
    return defaultRingtone;
  }

  public static String getRingtoneFromUser(
      String username, String tenant, String host, String port) {
    var ctx = Ctx.app();
    try {
      var a = Account.find(username, tenant, host, port);
      if (a != null) {
        if (a.getString("ringtoneName").equalsIgnoreCase("default")) {
          return getRingtoneByName(a.getString("pbxRingtone"));
        }
        return a.getString("ringtoneData");
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return defaultRingtone;
  }

  public static int getRingtoneFromRaw(String ringtoneName) {
    var ctx = Ctx.app();
    var resId = ctx.getResources().getIdentifier(ringtoneName, "raw", ctx.getPackageName());
    if (resId == 0) {
      // fallback
      resId = ctx.getResources().getIdentifier(staticRingtones[0], "raw", ctx.getPackageName());
    }
    return resId;
  }

  public static String getRingtoneByName(String ringtoneName) {
    var ctx = Ctx.app();
    if (Arrays.asList(staticRingtones).contains(ringtoneName)) {
      return ringtoneName;
    }
    Cursor cursor = null;
    try {
      var ringtoneManager = new RingtoneManager(ctx);
      ringtoneManager.setType(RingtoneManager.TYPE_RINGTONE);
      cursor = ringtoneManager.getCursor();
      while (cursor.moveToNext()) {
        var title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX);
        if (ringtoneName.equalsIgnoreCase(title)) {
          return ringtoneManager.getRingtoneUri(cursor.getPosition()).toString();
        }
      }
    } catch (Exception e) {
      Log.d(TAG, "getRingtoneByName: " + e.getMessage());
    } finally {
      if (cursor != null) {
        cursor.close();
      }
    }
    return defaultRingtone;
  }

  public static Boolean checkStaticRingtone(String ringtone) {
    return Arrays.asList(staticRingtones)
        .contains(ringtone); // if true then it uses static ringtone
  }

  public static WritableMap handleRingtoneList(String title, String uri) {
    var m = new WritableNativeMap();
    m.putString("title", title);
    m.putString("uri", uri);
    return m;
  }
}
