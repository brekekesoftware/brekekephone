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

  // the account js is signed in as, pushed from js on sign in and cleared on sign out
  // and on account switch. empty user means unknown: callers must not act on it
  private static String signedInUser = "";
  private static String signedInTenant = "";
  private static String signedInHost = "";
  private static String signedInPort = "";

  public static void setSignedIn(String u, String t, String h, String p) {
    signedInUser = u == null ? "" : u;
    signedInTenant = t == null ? "" : t;
    signedInHost = h == null ? "" : h;
    signedInPort = p == null ? "" : p;
  }

  public static boolean hasSignedIn() {
    return !TextUtils.isEmpty(signedInUser);
  }

  // is this pn for the account js is signed in as, same matching rule as find()
  public static boolean isSignedIn(Map<String, String> m) {
    return signedInUser.equals(PN.username(m))
        && equals(signedInTenant, PN.tenant(m))
        && equals(signedInHost, PN.host(m))
        && equals(signedInPort, PN.port(m));
  }

  // find from pn data map
  public static JSONObject find(Map<String, String> m) {
    var u = PN.username(m);
    var t = PN.tenant(m);
    var h = PN.host(m);
    var p = PN.port(m);
    return find(u, t, h, p);
  }

  // compare strings with falsish check
  private static boolean equals(String v1, String v2) {
    return TextUtils.isEmpty(v1) || TextUtils.isEmpty(v2) || v1.equals(v2);
  }
}
