package com.brekeke.phonedev;

import android.Manifest;
import android.Manifest.permission;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.widget.Toast;
import androidx.annotation.NonNull;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import io.wazo.callkeep.RNCallKeepModule;
public class MainActivity extends ReactActivity {
  // ==========================================================================
  // set/unset BrekekeUtils.main
final int  PERMISSIONS_REQUEST_WRITE_CALL_LOG = 1234556;

  @Override
  protected void onStart() {
    BrekekeUtils.main = this;
    super.onStart();
  }
  /**
   * Show the contacts in the ListView.
   */
  private void requestPermissionCallLog() {
    // Check the SDK version and whether the permission is already granted or not.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && checkSelfPermission(permission.WRITE_CALL_LOG) != PackageManager.PERMISSION_GRANTED && checkSelfPermission(permission.WRITE_CONTACTS) != PackageManager.PERMISSION_GRANTED && checkSelfPermission(permission.PROCESS_OUTGOING_CALLS) != PackageManager.PERMISSION_GRANTED ) {
      requestPermissions(new String[]{Manifest.permission.WRITE_CALL_LOG, permission.WRITE_CONTACTS, permission.PROCESS_OUTGOING_CALLS}, PERMISSIONS_REQUEST_WRITE_CALL_LOG);
      //After this point you wait for callback in onRequestPermissionsResult(int, String[], int[]) overriden method
    } else {
      // Android version is lesser than 6.0 or the permission is already granted.
    }
  }

//  @Override
//  public void onRequestPermissionsResult(int requestCode, String[] permissions,
//   int[] grantResults) {
//    if (requestCode == PERMISSIONS_REQUEST_READ_CONTACTS) {
//      if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
//        // Permission is granted
//        showContacts();
//      } else {
//        Toast.makeText(this, "Until you grant the permission, we canot display the names", Toast.LENGTH_SHORT).show();
//      }
//    }
//  }

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
    requestPermissionCallLog();
    String phone= getIntent().getStringExtra("extra_phone");
    Toast.makeText(getBaseContext(), ""+phone, Toast.LENGTH_LONG).show();
//    if(!phone.equals(null)){
//      Toast.makeText(getBaseContext(), phone, Toast.LENGTH_LONG).show();
//    }
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
  }

  @Override
  public void onRequestPermissionsResult(
    int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);

    switch (requestCode) {
      case RNCallKeepModule.REQUEST_READ_PHONE_STATE:
        RNCallKeepModule.onRequestPermissionsResult(requestCode, permissions, grantResults);
        break;
      case PERMISSIONS_REQUEST_WRITE_CALL_LOG:
        if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
          // Permission is granted
          requestPermissionCallLog();
        } else {
          Toast.makeText(this, "Until you grant the permission, we canot display the names", Toast.LENGTH_SHORT).show();
        }
        break;
    }
  }
}
