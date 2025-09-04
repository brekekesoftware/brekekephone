package com.brekeke.phone.utils;

import android.text.TextUtils;
import java.util.Map;

// utils to parse push notification data
// see the related part in rn js for reference

public class PN {
  public static String id(Map<String, String> m) {
    return get(m, "pn-id", "pnId");
  }

  public static String autoAnswer(Map<String, String> m) {
    return get(m, "autoanswer", "autoAnswer");
  }

  public static String callerName(Map<String, String> m) {
    var v = get(m, "displayname", "displayName");
    if (TextUtils.isEmpty(v)) {
      v = get(m, "from");
    }
    if (TextUtils.isEmpty(v)) {
      v = L.loading();
    }
    return v;
  }

  public static String avatar(Map<String, String> m) {
    return get(m, "image");
  }

  public static String avatarSize(Map<String, String> m) {
    return get(m, "image_size", "imageSize");
  }

  public static String ringtone(Map<String, String> m) {
    return get(m, "ringtone");
  }

  public static String username(Map<String, String> m) {
    return get(m, "to", "pbxUsername");
  }

  public static String tenant(Map<String, String> m) {
    return get(m, "tenant", "pbxTenant");
  }

  public static String host(Map<String, String> m) {
    return get(m, "host", "pbxHostname");
  }

  public static String port(Map<String, String> m) {
    return get(m, "pbxPort", "port");
  }

  private static String get(Map<String, String> m, String k) {
    // try to prioritize prefix: x_
    var v = m.get("x_" + k);
    if (!TextUtils.isEmpty(v)) {
      return v;
    }
    return m.get(k);
  }

  private static String get(Map<String, String> m, String k1, String k2) {
    var v = get(m, k1);
    if (!TextUtils.isEmpty(v)) {
      return v;
    }
    return get(m, k2);
  }

  private static String get(Map<String, String> m, String k1, String k2, String k3) {
    var v = get(m, k1, k2);
    if (!TextUtils.isEmpty(v)) {
      return v;
    }
    return get(m, k3);
  }
}
