package com.brekeke.phonedev;

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.NonNull;
import com.facebook.react.ReactActivity;
import io.wazo.callkeep.RNCallKeepModule;

public class MainActivity extends ReactActivity {
  @Override
  protected void onStart() {
    BrekekeModule.main = this;
    super.onStart();
  }

  // @Override
  // protected void onDestroy() {
  //   BrekekeModule.main = null;
  //   super.onDestroy();
  // }

  @Override
  public void onBackPressed() {
    // Do not exit on back pressed
    BrekekeModule.emit("onBackPressed", "");
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Bundle extras = getIntent().getExtras();
    if (extras != null
        && extras.get("id") != null
        && extras.get("id").toString().startsWith("missedcall")) {
      BrekekeModule.emit("onGoToPageRecentCall", "");
    }
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
