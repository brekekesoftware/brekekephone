package com.brekeke.phonedev.utils;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.util.Log;

import androidx.core.content.ContextCompat;

import com.brekeke.phonedev.lpc.LpcUtils;
import com.facebook.react.bridge.ReactApplicationContext;

import java.util.ArrayList;

public class NetworkUtils {
    public static boolean matchSsid(Context ctx, ArrayList<String> s) {
        WifiManager wifiManager = (WifiManager) ctx.getSystemService(Context.WIFI_SERVICE);
        WifiInfo wifiInfo = wifiManager.getConnectionInfo();
        var w = wifiInfo.getSSID().replace("\"", "");
        Log.d(LpcUtils.TAG, "matchSsid: " + w);
        Log.d(LpcUtils.TAG, "matchSsid: is match ? " + s.contains(w));
        return s.contains(w);
    }

    public static boolean checkAllowAllTheTime(Context ctx) {
        boolean hasForeground = ContextCompat.checkSelfPermission(
                ctx, Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED;

        boolean hasBackground = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            hasBackground = ContextCompat.checkSelfPermission(
                    ctx, Manifest.permission.ACCESS_BACKGROUND_LOCATION
            ) == PackageManager.PERMISSION_GRANTED;
        }
        return hasForeground && hasBackground;
    }
}
