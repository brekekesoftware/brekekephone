package com.brekeke.phonedev

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.NonNull
import com.brekeke.phonedev.lpc.LpcUtils
import com.brekeke.phonedev.utils.Ctx
import com.brekeke.phonedev.utils.Emitter
import com.brekeke.phonedev.utils.LocationPermissionHelper
import com.brekeke.phonedev.utils.LocationUtils
import com.brekeke.phonedev.utils.Perm
import com.brekeke.phonedev.utils.Ringtone
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import io.wazo.callkeep.RNCallKeepModule

class MainActivity : ReactActivity() {
  // ==========================================================================
  // set/unset BrekekeUtils.main
  override fun onStart() {
    BrekekeUtils.main = this
    super.onStart()
  }

  override fun onResume() {
    super.onResume()
    if (LocationUtils.gpsPromise != null) {
      val e = LocationUtils.isLocationEnabled(applicationContext);
      LocationUtils.gpsPromise.resolve(e)
      LocationUtils.gpsPromise = null
    }

    if (LocationPermissionHelper.locationPermissionPromise != null) {
      val e = LocationPermissionHelper.isForegroundPermissionGranted(applicationContext);
      LocationPermissionHelper.locationPermissionPromise.resolve(e)
      LocationPermissionHelper.locationPermissionPromise = null
    }

    if (LocationPermissionHelper.backgroundLocationPermissionPromise != null) {
      val e = LocationPermissionHelper.isBackgroundPermissionGranted(applicationContext);
      LocationPermissionHelper.backgroundLocationPermissionPromise.resolve(e)
      LocationPermissionHelper.backgroundLocationPermissionPromise = null
    }
    // permissions
    Perm.resolve()
    // call history
    // TODO: temporary disabled
    if (true) return
    val b = intent.extras ?: return
    val phone = b.getString("extra_phone")
    if (phone.isNullOrEmpty()) return
    intent.removeExtra("extra_phone")
    handleMakeCall(phone)

  }

  override fun onDestroy() {
    BrekekeUtils.main = null
    BrekekeUtils.dialerCheckState = DialerCheckState.IDLE
    Ringtone.stop()
    Emitter.emit("onDestroyMainActivity", "")
    super.onDestroy()
  }

  // ==========================================================================
  // check if notification pressed
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (BrekekeUtils.main == null) {
      BrekekeUtils.main = this
    }
    // handle default dialer
    BrekekeUtils.defaultDialerLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
          checkSetDefaultDialerResult(result.resultCode)
        }

    if (isOpenedFromLauncherIcon(intent)) {
      BrekekeUtils.checkDefaultDialer()
    }
    // handle call from other app
    handleIntent(intent)
  }

  private fun isOpenedFromLauncherIcon(intent: Intent?): Boolean {
    return intent?.action == Intent.ACTION_MAIN &&
        intent.categories?.contains(Intent.CATEGORY_LAUNCHER) == true
  }

  // ==========================================================================
  // stop ringtone on any press and custom back btn handler
  override fun dispatchKeyEvent(e: KeyEvent): Boolean {
    val k = e.keyCode
    val a = e.action
    Emitter.debug("MainActivity.onKeyDown k=$k a=$a")
    Ringtone.stop()
    if (k == KeyEvent.KEYCODE_BACK || k == KeyEvent.KEYCODE_SOFT_LEFT) {
      if (a == KeyEvent.ACTION_DOWN) {
        Emitter.emit("onBackPressed", "")
      }
      return true
    }
    return super.dispatchKeyEvent(e)
  }

  // ==========================================================================
  // react-native config
  override fun getMainComponentName(): String = "BrekekePhone"

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return object : ReactActivityDelegate(this, mainComponentName) {
      override fun isFabricEnabled(): Boolean = false
    }
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    // handle call from other app
    handleIntent(intent)
  }

  override fun onRequestPermissionsResult(
      requestCode: Int,
      @NonNull permissions: Array<String>,
      @NonNull grantResults: IntArray
  ) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    val granted = grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
    Log.d(LpcUtils.TAG, "grantResults " + grantResults[0]);
    when (requestCode) {
      RNCallKeepModule.REQUEST_READ_PHONE_STATE ->
          RNCallKeepModule.onRequestPermissionsResult(requestCode, permissions, grantResults)
      LocationPermissionHelper.REQUEST_FOREGROUND_PERMISSION ->
        if (granted) {
        Log.d(LpcUtils.TAG, "Foreground granted → request background");
          LocationPermissionHelper.locationPermissionPromise.resolve(true)
      } else {
        Log.d(LpcUtils.TAG, "Từ chối → có thể show rationale hoặc dẫn tới App Settings");
//        LocationPermissionHelper.locationPermissionPromise.resolve(false)
          LocationPermissionHelper.openAppSettings(applicationContext)
      }
      LocationPermissionHelper.REQUEST_BACKGROUND_PERMISSION -> {
        if (!granted) {
          Log.d(LpcUtils.TAG, "Background permission bị từ chối");
          LocationPermissionHelper.backgroundLocationPermissionPromise.resolve(false)
          return
        }
        LocationPermissionHelper.backgroundLocationPermissionPromise.resolve(true)
      }
    }

  }

  // ==========================================================================
  // handle call from other app
  private fun handleIntent(intent: Intent) {
    if (Intent.ACTION_VIEW == intent.action || intent.hasCategory(Intent.CATEGORY_BROWSABLE)) {
      val data: Uri? = intent.data
      if (data == null || data.scheme != "tel") return
      val phoneNumber = data.schemeSpecificPart
      if (phoneNumber.isNullOrEmpty()) return
      handleMakeCall(phoneNumber)
    }
  }

  private fun handleMakeCall(phone: String) {
    if (Emitter.emit("makeCall", phone)) {
      return
    }
    var h = Ctx.h()
    h.postDelayed({ Emitter.emit("makeCall", phone) }, 5000)
  }

  private fun checkSetDefaultDialerResult(resultCode: Int) {
    when (resultCode) {
      RESULT_CANCELED ->
          BrekekeUtils.resultDefaultDialer("Permission to set default phone app was canceled")
      RESULT_OK -> BrekekeUtils.resultDefaultDialer("Default dialer set successfully")
    }
  }
}
