package com.brekeke.phonedev.utils;

import org.json.JSONArray;
import org.json.JSONObject;

public class AccountUtils {
  private static boolean compareFalsishField(String v1, String v2) {
    return isNullOrEmpty(v1) || isNullOrEmpty(v2) || v1.equals(v2);
  }

  private static boolean isNullOrEmpty(String s) {
    return s == null || s.isEmpty();
  }

  public static JSONObject findAccountPartial(JSONArray profilesArray, String username, String tenant, String host, String port) {
    for (int i = 0; i < profilesArray.length(); i++) {
      JSONObject acc = profilesArray.optJSONObject(i);
      if (acc == null) continue;

      String accUsername = acc.optString("pbxUsername", "");
      if (isNullOrEmpty(accUsername)) continue;

      if (accUsername.equals(username)
              && compareFalsishField(acc.optString("pbxTenant", ""), tenant)
              && compareFalsishField(acc.optString("pbxHostname", ""), host)
              && compareFalsishField(acc.optString("pbxPort", ""), port)) {
        return acc;
      }
    }
    return null;
  }
}
