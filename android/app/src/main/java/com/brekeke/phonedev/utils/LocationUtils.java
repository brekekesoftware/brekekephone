package com.brekeke.phonedev.utils;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.provider.Settings;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import com.facebook.react.bridge.Promise;

public class LocationUtils {

  public static final int LOCATION_PERMISSION_REQUEST_CODE = 1111;

  public interface LocationStatusCallback {
    void onReady(); // Có quyền + GPS bật

    void onPermissionDenied(); // Thiếu quyền

    void onProviderDisabled(); // GPS / Network location chưa bật
  }

  public static Promise gpsPromise;

  /** Kiểm tra quyền truy cập vị trí */
  public static boolean hasLocationPermission(Context context) {
    return ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
            == PackageManager.PERMISSION_GRANTED
        || ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION)
            == PackageManager.PERMISSION_GRANTED;
  }

  /** Xin quyền truy cập vị trí */
  public static void requestLocationPermission(Activity activity) {
    ActivityCompat.requestPermissions(
        activity,
        new String[] {
          Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION
        },
        LOCATION_PERMISSION_REQUEST_CODE);
  }

  /** Kiểm tra xem Location service (GPS hoặc Network) đã bật chưa */
  public static boolean isLocationEnabled(Context context) {
    LocationManager lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
    if (lm == null) return false;

    return lm.isProviderEnabled(LocationManager.GPS_PROVIDER)
        || lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
  }

  /** Mở màn hình cài đặt bật Location */
  public static void openLocationSettings(Activity activity) {
    Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
    activity.startActivity(intent);
  }

  /** Kiểm tra tổng thể: quyền + GPS */
  public static void ensureLocationService(
      Activity activity, @NonNull LocationStatusCallback callback) {
    if (!hasLocationPermission(activity)) {
      requestLocationPermission(activity);
      callback.onPermissionDenied();
      return;
    }

    if (!isLocationEnabled(activity)) {
      callback.onProviderDisabled();
      return;
    }

    callback.onReady();
  }
}
