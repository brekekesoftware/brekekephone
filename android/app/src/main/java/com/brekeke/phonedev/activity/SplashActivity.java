package com.brekeke.phonedev;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Intent intent = new Intent(this, MainActivity.class);
    // https://github.com/crazycodeboy/react-native-splash-screen/issues/289
    Bundle extras = getIntent().getExtras();
    if (extras != null) {
      intent.putExtras(extras);
    }
    startActivity(intent);
    finish();
  }
}
