package com.brekeke.phonedev.utils

import android.os.Handler
import com.brekeke.phonedev.lpc.BrekekeLpcService

class MonitorConnection(private val timeoutMs: Long = DEFAULT_TIMEOUT_MS) {
  companion object {
    private const val DEFAULT_TIMEOUT_MS = 20000L
  }

  private val handler: Handler = Ctx.h()
  private var countReconnect = 0
  private var isConnected = false
  private val timeoutTask: Runnable = Runnable { onDisconnected() }

  fun onConnected() = onMessageReceived()

  fun onMessageReceived() {
    countReconnect = 0
    updateState(true)
    resetTimer()
  }

  fun onDisconnected() {
    updateState(false)
    resetTimer()
  }

  private fun resetTimer() {
    cancelTimer()
    handler.postDelayed(timeoutTask, timeoutMs)
  }

  fun cancelTimer() {
    handler.removeCallbacks(timeoutTask)
  }

  private fun updateState(connected: Boolean) {
    if (isConnected != connected) {
      isConnected = connected
      Emitter.debug("LPC connection: " + (if (connected) "CONNECTED" else "DISCONNECTED"))
    }
    if (!connected) {
      val iService = BrekekeLpcService.iService
      if (countReconnect > 1 && !BrekekeLpcService.isReconnectByNetworkChange && iService != null) {
        countReconnect = 0
        val ctx = Ctx.app()
        if (ctx != null) {
          BrekekeLpcService.isServiceStarted = false
          ctx.startForegroundService(iService)
        }
      }
      countReconnect++
    }
  }

  fun isConnected(): Boolean = isConnected
}
