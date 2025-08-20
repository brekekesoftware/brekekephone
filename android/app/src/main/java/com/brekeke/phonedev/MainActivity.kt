package com.brekeke.phonedev

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.NonNull
import com.brekeke.phonedev.utils.Ctx
import com.brekeke.phonedev.utils.Emitter
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
    Ringtone.stop()
    Emitter.emit("onDestroyMainActivity", "")
    super.onDestroy()
  }

  // ==========================================================================
  // check if notification pressed
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    // handle default dialer
    BrekekeUtils.defaultDialerLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
          checkSetDefaultDialerResult(result.resultCode)
        }
    // handle call from other app
    handleIntent(intent)
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
    when (requestCode) {
      RNCallKeepModule.REQUEST_READ_PHONE_STATE ->
          RNCallKeepModule.onRequestPermissionsResult(requestCode, permissions, grantResults)
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
          BrekekeUtils.resolveDefaultDialer("Permission to set default phone app was canceled")
      RESULT_OK -> BrekekeUtils.resolveDefaultDialer("Default dialer set successfully")
    }
  }
}
