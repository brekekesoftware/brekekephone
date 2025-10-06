package com.brekeke.phonedev.utils;

import android.os.Handler;

public class MonitorConnection {
  private static final long DEFAULT_TIMEOUT_MS = 20000;
  private Handler handler;

  private final long timeoutMs;

  private boolean isConnected = false;
  private final Runnable timeoutTask = () -> updateState(false);

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
    updateState(true);
    resetTimer();
  }

  public void onDisconnected() {
    updateState(false);
    cancelTimer();
  }

  private void resetTimer() {
    cancelTimer();
    handler.postDelayed(timeoutTask, timeoutMs);
  }

  private void cancelTimer() {
    handler.removeCallbacks(timeoutTask);
  }

  private void updateState(boolean connected) {
    if (isConnected != connected) {
      isConnected = connected;
      Emitter.debug("LPC connection: " + (connected ? "CONNECTED" : "DISCONNECTED"));
    }
  }

  public boolean isConnected() {
    return isConnected;
  }
}
