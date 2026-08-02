package com.brekeke.phonedev.activity

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.brekeke.phonedev.MainActivity

class SplashActivity : AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val intent = Intent(this, MainActivity::class.java)
    // https://github.com/crazycodeboy/react-native-splash-screen/issues/289
    val extras = getIntent().extras
    if (extras != null) intent.putExtras(extras)
    startActivity(intent)
    finish()
  }
}
