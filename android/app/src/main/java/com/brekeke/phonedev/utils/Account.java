package com.brekeke.phonedev.utils;

import android.text.TextUtils;
import java.util.Map;
import org.json.JSONObject;

public class Account {
  public static JSONObject find(String u, String t, String h, String p) {
    try {
      var arr = Storage.accounts();
      for (var i = 0; i < arr.length(); i++) {
        var a = arr.optJSONObject(i);
        if (a == null) {
          continue;
        }
        var u2 = a.optString("pbxUsername");
        if (TextUtils.isEmpty(u2)) {
          continue;
        }
        var t2 = a.optString("pbxTenant");
        var h2 = a.optString("pbxHostname");
        var p2 = a.optString("pbxPort");
        if (u2.equals(u) && equals(t2, t) && equals(h2, h) && equals(p2, p)) {
          return a;
        }
      }
    } catch (Exception e) {
    }
    return null;
  }

  // find from pn data map
  public static JSONObject find(Map<String, String> m) {
    var u = m.get("x_to");
    var t = m.get("x_tenant");
    var h = m.get("x_host");
    var p = m.get("x_port");
    return find(u, t, h, p);
  }

  // compare strings with falsish check
  // see account store on rn js for reference
  private static boolean equals(String v1, String v2) {
    return TextUtils.isEmpty(v1) || TextUtils.isEmpty(v2) || v1.equals(v2);
  }
}
