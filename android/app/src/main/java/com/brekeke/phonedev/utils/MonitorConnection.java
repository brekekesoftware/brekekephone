package com.brekeke.phonedev.utils;

import android.os.Handler;
import com.brekeke.phonedev.lpc.BrekekeLpcService;

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
      Emitter.debug("LPC connection: " + (connected ? "CONNECTED" : "DISCONNECTED"));
    }

    if (!connected) {
      var iService = BrekekeLpcService.iService;
      if (countReconnect > 1 && !BrekekeLpcService.isReconnectByNetworkChange && iService != null) {
        countReconnect = 0;
        var ctx = Ctx.app();
        if (ctx != null) {
          BrekekeLpcService.isServiceStarted = false;
          ctx.startForegroundService(iService);
        }
      }
      countReconnect++;
    }
  }

  public boolean isConnected() {
    return isConnected;
  }
}
