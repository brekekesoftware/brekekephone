package com.brekeke.phonedev.utils;

import android.os.Handler;
import android.util.Log;
import com.brekeke.phonedev.lpc.BrekekeLpcService;
import com.brekeke.phonedev.lpc.LpcUtils;

public class MonitorConnection {
  private static final long DEFAULT_TIMEOUT_MS = 20000;
  private Handler handler;
  private final long timeoutMs;
  private int countReconnect = 0;
  private boolean isConnected = false;
  private final Runnable timeoutTask = this::onDisconnected;

  public MonitorConnection() {
    this(DEFAULT_TIMEOUT_MS);
  }

  public MonitorConnection(long timeoutMs) {
    this.timeoutMs = timeoutMs;
    handler = Ctx.h();
  }

  public void onConnected() {
    onMessageReceived();
  }

  public void onMessageReceived() {
    countReconnect = 0;
    updateState(true);
    resetTimer();
    Log.d(LpcUtils.TAG, "Update timer");
  }

  public void onDisconnected() {
    updateState(false);
    resetTimer();
  }

  private void resetTimer() {
    cancelTimer();
    handler.postDelayed(timeoutTask, timeoutMs);
  }

  public void cancelTimer() {
    handler.removeCallbacks(timeoutTask);
  }

  private void updateState(boolean connected) {
    if (isConnected != connected) {
      isConnected = connected;
      Emitter.debug(
          "[MonitorConnection] LPC connection: " + (connected ? "CONNECTED" : "DISCONNECTED"));
    }

    if (!connected) {
      var i = BrekekeLpcService.iService;
      if (countReconnect > 2
          && !BrekekeLpcService.isReconnectByNetworkChange
          && i != null
          && BrekekeLpcService.isServiceStarted) {
        countReconnect = 0;
        var ctx = Ctx.app();
        if (ctx != null) {
          BrekekeLpcService.isServiceStarted = false;
          i.putExtra("reason", "LPC re-connect by pbx");
          ctx.startForegroundService(i);
          Emitter.debug("[MonitorConnection] LPC re-connect by pbx:");
        }
      }
      countReconnect++;
    }
  }

  public boolean isConnected() {
    return isConnected;
  }
}
