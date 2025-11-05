package com.brekeke.phonedev.utils;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.brekeke.phonedev.lpc.LpcUtils;
import com.facebook.react.bridge.Promise;

public class LocationPermissionHelper {

  public static final int REQUEST_FOREGROUND_PERMISSION = 1112;
  public static final int REQUEST_BACKGROUND_PERMISSION = 1113;
  public static Promise locationPermissionPromise;
  public static Promise backgroundLocationPermissionPromise;

  /** Kiểm tra foreground location permission */
  public static boolean isForegroundPermissionGranted(Context context) {
    boolean granted =
        ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
            == PackageManager.PERMISSION_GRANTED;
    Log.d(LpcUtils.TAG, "isForegroundPermissionGranted: " + granted);
    return granted;
  }

  /** Kiểm tra background location permission (Android 10+) */
  public static boolean isBackgroundPermissionGranted(Context context) {
    boolean granted;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) { // Android 10+
      granted =
          ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_BACKGROUND_LOCATION)
              == PackageManager.PERMISSION_GRANTED;
    } else {
      granted = true; // < Android 10 → No permission required
    }
    Log.d(LpcUtils.TAG, "isBackgroundPermissionGranted: " + granted);
    return granted;
  }

  /** Request foreground permission */
  public static void requestForegroundPermission(Activity activity) {
    Log.d(LpcUtils.TAG, "Requesting foreground location permission");
    ActivityCompat.requestPermissions(
        activity,
        new String[] {Manifest.permission.ACCESS_FINE_LOCATION},
        REQUEST_FOREGROUND_PERMISSION);
  }

  /** Request background permission */
  public static void requestBackgroundPermission(Activity activity) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      Log.d(LpcUtils.TAG, "Requesting background location permission");
      ActivityCompat.requestPermissions(
          activity,
          new String[] {Manifest.permission.ACCESS_BACKGROUND_LOCATION},
          REQUEST_BACKGROUND_PERMISSION);
    }
  }

  /** Kiểm tra và request permissions đầy đủ */
  public static void checkAndRequestBackgroundLocationPermissions(Activity activity, Promise p) {
    var isBackgroundGranted = isBackgroundPermissionGranted(activity);
    if (isBackgroundGranted) {
      p.resolve(true);
      return;
    }
    Log.d(LpcUtils.TAG, "Checking background location permissions");
      backgroundLocationPermissionPromise = p;
    requestBackgroundPermission(activity);
  }

  public static void checkAndRequestLocationPermission(Activity activity, Promise p) {
    var isForegroundGranted = isForegroundPermissionGranted(activity);
    if (isForegroundGranted) {
      p.resolve(true);
      return;
    }
    Log.d(LpcUtils.TAG, "Checking foreground location permissions");
    locationPermissionPromise = p;
    requestForegroundPermission(activity);
  }

  public static void openAppSettings(Context context) {
    try {
      Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
      Uri uri = Uri.fromParts("package", context.getPackageName(), null);
      intent.setData(uri);
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      context.startActivity(intent);
        Log.d(LpcUtils.TAG, "openAppSettings");
    } catch (Exception e) {
        Log.d(LpcUtils.TAG, "openAppSettings " + e.getMessage());
    }
  }
}
