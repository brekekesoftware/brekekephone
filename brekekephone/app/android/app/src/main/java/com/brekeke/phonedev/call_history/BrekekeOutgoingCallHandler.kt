package com.brekeke.phonedev.call_history

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.brekeke.phonedev.MainActivity

class BrekekeOutgoingCallHandler : BroadcastReceiver() {
  override fun onReceive(ctx: Context, intent: Intent) {
    val number = intent.getStringExtra("com.android.phone.ROAMING_ORIGIN_NUMBER") ?: return
    val i = Intent(ctx, MainActivity::class.java)
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    i.putExtra("extra_phone", number)
    ctx.startActivity(i)
  }
}
