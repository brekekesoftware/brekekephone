package com.brekeke.phonedev.lpc

import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.util.Log
import com.brekeke.phonedev.utils.Emitter
import com.google.gson.Gson
import java.io.FileNotFoundException

// intent service to bind the main lpc service

class BrekekeLpcServiceIntent : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    try {
      Log.d(LpcUtils.TAG, "onStartCommand in intent service")
      Emitter.debug("[BrekekeLpcServiceIntent] onStartCommand in intent service")
      val config = LpcUtils.readConfig(this)
      if (config.isNotEmpty()) {
        val gson = Gson()
        val settings = gson.fromJson(config, LpcModel.Settings::class.java)
        val ctx: Context = applicationContext
        val i =
            LpcUtils.putConfigToIntent(
                settings.host,
                settings.port,
                settings.token,
                settings.userName,
                settings.tlsKeyHash,
                settings.remoteSsids,
                Intent(ctx, BrekekeLpcService::class.java),
            )
        ctx.startForegroundService(i)
        ctx.bindService(i, LpcUtils.connection, BIND_AUTO_CREATE)
        if (LpcUtils.LpcCallback.cb == null) {
          LpcUtils.LpcCallback.setLpcCallback(
              object : LpcUtils.LpcCallback.CallbackInterface {
                override fun getStateServer(b: Boolean) {
                  if (!b) ctx.unbindService(LpcUtils.connection)
                }
              }
          )
        }
      }
    } catch (_: FileNotFoundException) {}
    return START_STICKY
  }
}
