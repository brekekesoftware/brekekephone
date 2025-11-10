package com.brekeke.phonedev.utils;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.location.LocationManager;
import android.provider.Settings;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;

public class LocationUtils {

  public interface LocationStatusCallback {
    void onReady();

    void onProviderDisabled();
  }

  public static Promise gpsPromise;

  public static boolean isLocationEnabled(Context context) {
    LocationManager lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
    if (lm == null) return false;

    return lm.isProviderEnabled(LocationManager.GPS_PROVIDER);
  }

  public static void openLocationSettings(Activity activity) {
    Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
    activity.startActivity(intent);
  }

  public static void ensureLocationService(
      Activity activity, @NonNull LocationStatusCallback callback) {

    if (!isLocationEnabled(activity)) {
      callback.onProviderDisabled();
      return;
    }

    callback.onReady();
  }

  public static void resolveLocationPromise(Context ctx) {
    if (gpsPromise != null) {
      var e = isLocationEnabled(ctx);
      gpsPromise.resolve(e);
      gpsPromise = null;
    }
  }
}
