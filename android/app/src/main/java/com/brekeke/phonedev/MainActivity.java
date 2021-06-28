package com.brekeke.phonedev;

import android.content.Intent;
import androidx.annotation.NonNull;
import com.facebook.react.ReactActivity;
import io.wazo.callkeep.RNCallKeepModule;

public class MainActivity extends ReactActivity {
  @Override
  protected void onStart() {
    IncomingCallModule.main = this;
    super.onStart();
  }

  // @Override
  // protected void onDestroy() {
  //   IncomingCallModule.main = null;
  //   super.onDestroy();
  // }

  @Override
  public void onBackPressed() {
    // Do not exit on back pressed
    moveTaskToBack(true);
  }

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
