package com.brekeke.phonedev.utils;

import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.util.Log;
import java.util.ArrayList;

public class NetworkUtils {
  public static boolean matchSsid(Context ctx, ArrayList<String> s) {
    if (!LocationUtils.isLocationEnabled(ctx)) {
      Emitter.debug("[BrekekeLpcService] GPS is disabled");
      return false;
    }
    WifiManager wifiManager = (WifiManager) ctx.getSystemService(Context.WIFI_SERVICE);
    WifiInfo wifiInfo = wifiManager.getConnectionInfo();
    var w = wifiInfo.getSSID().replace("\"", "");
    Emitter.debug("[BrekekeLpcService] SSID " + w);
    Log.d("[Wy]", "matchSsid: " + w);
    return s.contains(w);
  }
}
