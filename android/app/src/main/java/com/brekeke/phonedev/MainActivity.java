package com.brekeke.phonedev;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.view.KeyEvent;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import com.brekeke.phonedev.lpc.LpcUtils;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import io.wazo.callkeep.RNCallKeepModule;

public class MainActivity extends ReactActivity {

  // ==========================================================================
  // set/unset BrekekeUtils.main
  @Override
  protected void onStart() {
    BrekekeUtils.main = this;
    super.onStart();
  }

  @Override
  protected void onResume() {
    super.onResume();

    BrekekeUtils.resolveIgnoreBattery(
        BrekekeUtils.isIgnoringBatteryOptimizationPermissionGranted(this));
    BrekekeUtils.resolveOverlayScreen(BrekekeUtils.isOverlayPermissionGranted(this));

    // android lpc
    BrekekeUtils.androidLpcResolvePerm(LpcUtils.androidLpcIsPermGranted(this));

    // call history
    // TODO: temporary disabled
    if (true) {
      return;
    }
    Bundle b = getIntent().getExtras();
    if (b == null) {
      return;
    }
    String phone = b.getString("extra_phone");
    if (phone == null || phone.isEmpty()) {
      return;
    }
    // remove cache when open app again
    getIntent().removeExtra("extra_phone");
    if (BrekekeUtils.eventEmitter != null) {
      BrekekeUtils.emit("makeCall", phone);
      return;
    }
    Runnable r =
        new Runnable() {
          public void run() {
            BrekekeUtils.emit("makeCall", phone);
          }
        };
    Handler handler = new android.os.Handler();
    handler.postDelayed(r, 5000);
  }

  @Override
  protected void onStop() {
    super.onStop();
  }

  @Override
  protected void onPause() {
    super.onPause();
  }

  @Override
  protected void onDestroy() {
    BrekekeUtils.main = null;
    BrekekeUtils.staticStopRingtone();
    super.onDestroy();
  }

  // ==========================================================================
  // check if notification pressed
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // handle default dialer
    BrekekeUtils.defaultDialerLauncher =
        registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> checkSetDefaultDialerResult(result.getResultCode()));
    // handle call from other app
    handleIntent(getIntent());
  }

  // ==========================================================================
  // stop ringtone on any press and custom back btn handler
  @Override
  public boolean dispatchKeyEvent(KeyEvent e) {
    int k = e.getKeyCode();
    int a = e.getAction();
    BrekekeUtils.emit("debug", "MainActivity.onKeyDown k=" + k + " a=" + a);
    // stop ringtone if any of the hardware key press
    BrekekeUtils.staticStopRingtone();
    // handle back btn press, remember that this event fire twice, down/up
    if (k == KeyEvent.KEYCODE_BACK || k == KeyEvent.KEYCODE_SOFT_LEFT) {
      if (a == KeyEvent.ACTION_DOWN) {
        BrekekeUtils.emit("onBackPressed", "");
      }
      return true;
    }
    return super.dispatchKeyEvent(e);
  }

  // ==========================================================================
  // react-native config
  @Override
  protected String getMainComponentName() {
    return "BrekekePhone";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this, getMainComponentName(), DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    // handle call from other app
    handleIntent(intent);
  }

  private void handleIntent(Intent intent) {
    if (Intent.ACTION_VIEW.equals(intent.getAction())
        || intent.hasCategory(Intent.CATEGORY_BROWSABLE)) {
      Uri data = intent.getData();
      if (data == null || !"tel".equals(data.getScheme())) {
        return;
      }
      String phoneNumber = data.getSchemeSpecificPart();
      if (phoneNumber == null || phoneNumber.isEmpty()) {
        return;
      }
      handleMakeCall(phoneNumber);
    }
  }

  private void handleMakeCall(String phone) {
    if (BrekekeUtils.eventEmitter != null) {
      BrekekeUtils.emit("makeCall", phone);
      return;
    }
    Runnable r =
        new Runnable() {
          public void run() {
            BrekekeUtils.emit("makeCall", phone);
          }
        };
    Handler handler = new android.os.Handler();
    handler.postDelayed(r, 5000);
  }

  private void checkSetDefaultDialerResult(int resultCode) {
    switch (resultCode) {
      case RESULT_CANCELED:
        BrekekeUtils.resolveDefaultDialer("Permission to set default phone app was canceled");
        break;
      case RESULT_OK:
        BrekekeUtils.resolveDefaultDialer("Default dialer set successfully");
        break;
      default:
        break;
    }
  }

  @Override
  public void onRequestPermissionsResult(
      int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    switch (requestCode) {
      case RNCallKeepModule.REQUEST_READ_PHONE_STATE:
        RNCallKeepModule.onRequestPermissionsResult(requestCode, permissions, grantResults);
        break;
    }
  }
}
