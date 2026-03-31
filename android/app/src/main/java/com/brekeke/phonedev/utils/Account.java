package com.brekeke.phonedev.utils;

import android.text.TextUtils;
import java.util.Map;
import org.json.JSONObject;

// utils to handle account from local storage
// see the related part in rn js for reference

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
    var u = PN.username(m);
    var t = PN.tenant(m);
    var h = PN.host(m);
    var p = PN.port(m);
    return find(u, t, h, p);
  }

  // check if the account matching PN data has MFA pending
  public static boolean isMFAPending(Map<String, String> m) {
    try {
      var u = PN.username(m);
      var t = PN.tenant(m);
      var h = PN.host(m);
      var p = PN.port(m);
      var dataArr = Storage.data();
      if (dataArr == null) {
        return false;
      }
      for (var i = 0; i < dataArr.length(); i++) {
        var d = dataArr.optJSONObject(i);
        if (d == null) {
          continue;
        }
        var id = d.optString("id");
        if (TextUtils.isEmpty(id)) {
          continue;
        }
        // id is jsonStable: {"h":"host","p":"port","t":"tenant","u":"user"}
        var idObj = new JSONObject(id);
        var u2 = idObj.optString("u");
        var t2 = idObj.optString("t");
        var h2 = idObj.optString("h");
        var p2 = idObj.optString("p");
        if (u2.equals(u) && equals(t2, t) && equals(h2, h) && equals(p2, p)) {
          var mfa = d.optJSONObject("mfa");
          return mfa != null && mfa.optBoolean("pending", false);
        }
      }
    } catch (Exception e) {
      Emitter.error("Account.isMFAPending", e.getMessage());
    }
    return false;
  }

  // compare strings with falsish check
  private static boolean equals(String v1, String v2) {
    return TextUtils.isEmpty(v1) || TextUtils.isEmpty(v2) || v1.equals(v2);
  }
}
