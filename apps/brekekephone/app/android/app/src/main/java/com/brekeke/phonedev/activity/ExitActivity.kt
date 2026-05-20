package com.brekeke.phonedev.activity

import android.app.Activity
import android.os.Bundle

// end call then exit app, but also remove from "App Overview" button list
class ExitActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (android.os.Build.VERSION.SDK_INT >= 21) {
      finishAndRemoveTask()
    } else {
      finish()
    }
  }
}
