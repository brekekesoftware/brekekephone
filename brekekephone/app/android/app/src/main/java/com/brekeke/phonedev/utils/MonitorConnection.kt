package com.brekeke.phonedev.utils

import android.os.Handler
import com.brekeke.phonedev.lpc.BrekekeLpcService

class MonitorConnection(private val timeoutMs: Long = DEFAULT_TIMEOUT_MS) {
  companion object {
    private const val DEFAULT_TIMEOUT_MS = 20000L
  }

  // BUG-1230: lets the service reconnect the LPC socket on heartbeat timeout WITHOUT
  // restarting the foreground service (which re-posted the FGS notification every ~40s)
  fun interface ReconnectListener {
    fun onReconnectRequired()
  }

  private val handler: Handler = Ctx.h()
  private var countReconnect = 0
  private var isConnected = false
  private var stopped = false
  private var reconnectListener: ReconnectListener? = null
  private val timeoutTask: Runnable = Runnable { onDisconnected() }

  fun setReconnectListener(listener: ReconnectListener?) {
    reconnectListener = listener
  }

  // BUG-1230: give a freshly (re)started socket a full timeout window before the watchdog
  // counts it as failed again, without claiming CONNECTED prematurely
  fun resetCadence() {
    countReconnect = 0
    resetTimer()
  }

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
    // BUG-1230: don't re-arm after the service is stopped — a socket task that died on its
    // own right around onDestroy could otherwise re-arm this static singleton's timer forever
    if (stopped) {
      return
    }
    cancelTimer()
    handler.postDelayed(timeoutTask, timeoutMs)
  }

  fun cancelTimer() {
    handler.removeCallbacks(timeoutTask)
  }

  // BUG-1230: called from the service's onDestroy so the watchdog can never re-arm itself
  fun stop() {
    stopped = true
    cancelTimer()
  }

  private fun updateState(connected: Boolean) {
    if (isConnected != connected) {
      isConnected = connected
      Emitter.debug("LPC connection: " + (if (connected) "CONNECTED" else "DISCONNECTED"))
    }
    if (!connected) {
      // BUG-1230: ask the service to reconnect the SOCKET in-process instead of calling
      // startForegroundService (which re-posted the FGS notification every ~40s on accounts
      // that never receive an idle keepalive). Network-change reconnect is handled separately
      // by the service's network callback, so skip it here.
      val willReconnect =
          countReconnect > 1 &&
              !BrekekeLpcService.isReconnectByNetworkChange &&
              reconnectListener != null
      Emitter.debug(
          "[MonitorConnection] heartbeat timeout countReconnect=$countReconnect willReconnect=$willReconnect"
      )
      if (willReconnect) {
        countReconnect = 0
        reconnectListener?.onReconnectRequired()
      }
      countReconnect++
    }
  }

  fun isConnected(): Boolean = isConnected
}
