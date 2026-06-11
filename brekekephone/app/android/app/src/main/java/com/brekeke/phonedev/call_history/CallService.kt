package com.brekeke.phonedev.call_history

import android.content.Intent
import android.net.Uri
import android.telecom.Call
import android.telecom.InCallService
import android.telecom.TelecomManager

class CallService : InCallService() {
  override fun onCallAdded(call: Call) {
    super.onCallAdded(call)
    call.registerCallback(callCallback)
    try {
      if (call.details.handlePresentation == TelecomManager.PRESENTATION_ALLOWED) {
        val number = call.details.handle?.schemeSpecificPart ?: return
        val phoneNumberUri = Uri.parse("tel:$number")
        val intent = Intent(Intent.ACTION_VIEW, phoneNumberUri)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        intent.addCategory(Intent.CATEGORY_BROWSABLE)
        startActivity(intent)
      } else {
        // TODO: incoming call
      }
    } catch (_: Exception) {}
  }

  override fun onCallRemoved(call: Call) {
    super.onCallRemoved(call)
    call.unregisterCallback(callCallback)
  }

  private val callCallback =
      object : Call.Callback() {
        override fun onStateChanged(call: Call, state: Int) {}
      }
}
