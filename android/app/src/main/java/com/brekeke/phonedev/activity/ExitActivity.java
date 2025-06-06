package com.brekeke.phonedev;

import android.app.Activity;
import android.os.Bundle;

// end call then exit app, but also remove from "App Overview" button list
public class ExitActivity extends Activity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    if (android.os.Build.VERSION.SDK_INT >= 21) {
      finishAndRemoveTask();
    } else {
      finish();
    }
  }
}
