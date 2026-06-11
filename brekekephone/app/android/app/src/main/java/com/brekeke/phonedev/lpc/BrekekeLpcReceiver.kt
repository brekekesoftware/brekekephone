package com.brekeke.phonedev.lpc

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.brekeke.phonedev.utils.Emitter
import com.facebook.react.ReactApplication

// lpc boot receiver

class BrekekeLpcReceiver : BroadcastReceiver() {
  override fun onReceive(ctx: Context, intent: Intent) {
    if (!BrekekeLpcService.isServiceStarted) {
      if (Intent.ACTION_BOOT_COMPLETED == intent.action) {
        val i = Intent(ctx, BrekekeLpcServiceIntent::class.java)
        LpcUtils.createReactContextInBackground(ctx.applicationContext as ReactApplication)
        ctx.startService(i)
        Log.d(LpcUtils.TAG, "Boot completed")
        Emitter.debug("[BrekekeLpcReceiver] Boot completed and start lpc service in service intent")
      }
    } else {
      if (Intent.ACTION_SHUTDOWN == intent.action) {
        System.exit(0)
      }
    }
  }
}
