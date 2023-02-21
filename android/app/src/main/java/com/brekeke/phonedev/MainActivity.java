package com.brekeke.phonedev;

import android.content.Intent;
import android.os.Bundle;
import android.view.KeyEvent;
import androidx.annotation.NonNull;
import com.facebook.react.ReactActivity;
import io.wazo.callkeep.RNCallKeepModule;
import org.json.JSONObject;

public class MainActivity extends ReactActivity {
  // ==========================================================================
  // Set/unset BrekekeUtils.main
  @Override
  protected void onStart() {
    BrekekeUtils.main = this;
    super.onStart();
  }

  @Override
  protected void onDestroy() {
    BrekekeUtils.main = null;
    super.onDestroy();
  }

  // ==========================================================================
  // Check if notification pressed
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Bundle extras = getIntent().getExtras();
    if (extras != null) {
      JSONObject data = new JSONObject();
      for (String key : extras.keySet()) {
        try {
          data.put(key, extras.get(key));
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
      BrekekeUtils.emit("onNotificationPress", data.toString());
    }
  }

  // ==========================================================================
  // Do not exit on back pressed
  @Override
  public void onBackPressed() {
    BrekekeUtils.emit("debug", "MainActivity.onBackPressed");
    BrekekeUtils.emit("onBackPressed", "");
  }

  // ==========================================================================
  // Stop ringtone if any of the hardware key press
  // Same with IncomingCallActivity
  @Override
  public boolean onKeyDown(int k, KeyEvent e) {
    BrekekeUtils.emit("debug", "MainActivity.onKeyDown k=" + k);
    if (k == KeyEvent.KEYCODE_BACK || k == KeyEvent.KEYCODE_SOFT_LEFT) {
      BrekekeUtils.emit("onBackPressed", "");
    } else {
      BrekekeUtils.staticStopRingtone();
    }
    return super.onKeyDown(k, e);
  }

  @Override
  public boolean dispatchKeyEvent(KeyEvent e) {
    return onKeyDown(e.getAction(), e);
  }

  // ==========================================================================
  // React Native config
  @Override
  protected String getMainComponentName() {
    return "BrekekePhone";
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
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
