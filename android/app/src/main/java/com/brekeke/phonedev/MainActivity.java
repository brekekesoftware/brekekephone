package com.brekeke.phonedev;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.role.RoleManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.telecom.TelecomManager;
import android.view.KeyEvent;
import android.widget.Toast;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import io.wazo.callkeep.RNCallKeepModule;

public class MainActivity extends ReactActivity {
  // ==========================================================================
  // set/unset BrekekeUtils.main
  private static final int REQUEST_CODE_SET_DEFAULT_DIALER = 123;
  private ActivityResultLauncher<Intent> startActivityForResultLauncher;

  @Override
  protected void onStart() {
    BrekekeUtils.main = this;
    super.onStart();
  }

  @Override
  protected void onResume() {
    super.onResume();
    // call history
    // temporary disabled
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
    // handle Default Dialer app
    startActivityForResultLauncher =
        registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> checkSetDefaultDialerResult(result.getResultCode()));
    checkDefaultDialer();
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

  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode == REQUEST_CODE_SET_DEFAULT_DIALER) {
      checkSetDefaultDialerResult(resultCode);
    }
  }

  @SuppressLint("QueryPermissionsNeeded")
  @TargetApi(Build.VERSION_CODES.M)
  private void checkDefaultDialer() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      return;
    }
    TelecomManager telecomManager = (TelecomManager) getSystemService(TELECOM_SERVICE);
    if (telecomManager == null) {
      return;
    }
    String packageName = getPackageName();
    boolean isAlreadyDefaultDialer = packageName.equals(telecomManager.getDefaultDialerPackage());
    if (isAlreadyDefaultDialer) {
      return;
    }
    Intent intent =
        new Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER)
            .putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, packageName);
    if (intent.resolveActivity(this.getPackageManager()) == null) {
      return;
    }

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
      startActivityForResultLauncher.launch(intent);
    } else {
      RoleManager rm = this.getSystemService(RoleManager.class);
      if (rm != null && rm.isRoleAvailable(RoleManager.ROLE_DIALER)) {
        startActivityForResultLauncher.launch(rm.createRequestRoleIntent(RoleManager.ROLE_DIALER));
      }
    }
  }

  private void checkSetDefaultDialerResult(int resultCode) {
    switch (resultCode) {
      case RESULT_CANCELED:
        Toast.makeText(this, L.messagePermissionSetDefaultPhoneApp(), Toast.LENGTH_SHORT).show();
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
