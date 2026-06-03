package com.brekeke.phonedev.utils;

import android.os.Handler;
import com.brekeke.phonedev.lpc.BrekekeLpcService;

public class MonitorConnection {
  // BUG-1230: lets the service reconnect the LPC socket on heartbeat timeout WITHOUT
  // restarting the foreground service (which re-posted the FGS notification every ~40s)
  public interface ReconnectListener {
    void onReconnectRequired();
  }

  private static final long DEFAULT_TIMEOUT_MS = 20000;
  private Handler handler;
  private final long timeoutMs;
  private int countReconnect = 0;
  private boolean isConnected = false;
  private boolean stopped = false;
  private ReconnectListener reconnectListener;
  private final Runnable timeoutTask = this::onDisconnected;

  public MonitorConnection() {
    this(DEFAULT_TIMEOUT_MS);
  }

  public MonitorConnection(long timeoutMs) {
    this.timeoutMs = timeoutMs;
    handler = Ctx.h();
  }

  public void setReconnectListener(ReconnectListener listener) {
    reconnectListener = listener;
  }

  // BUG-1230: give a freshly (re)started socket a full timeout window before the watchdog
  // counts it as failed again, without claiming CONNECTED prematurely
  public void resetCadence() {
    countReconnect = 0;
    resetTimer();
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
    // BUG-1230: don't re-arm after the service is stopped — a socket task that died on its
    // own right around onDestroy could otherwise re-arm this static singleton's timer forever
    if (stopped) {
      return;
    }
    cancelTimer();
    handler.postDelayed(timeoutTask, timeoutMs);
  }

  public void cancelTimer() {
    handler.removeCallbacks(timeoutTask);
  }

  // BUG-1230: called from the service's onDestroy so the watchdog can never re-arm itself
  public void stop() {
    stopped = true;
    cancelTimer();
  }

  private void updateState(boolean connected) {
    if (isConnected != connected) {
      isConnected = connected;
      Emitter.debug("LPC connection: " + (connected ? "CONNECTED" : "DISCONNECTED"));
    }

    if (!connected) {
      // BUG-1230: ask the service to reconnect the SOCKET in-process instead of calling
      // startForegroundService (which re-posted the FGS notification every ~40s on accounts
      // that never receive an idle keepalive). Network-change reconnect is handled separately
      // by the service's network callback, so skip it here.
      boolean willReconnect =
          countReconnect > 1
              && !BrekekeLpcService.isReconnectByNetworkChange
              && reconnectListener != null;
      Emitter.debug(
          "[MonitorConnection] heartbeat timeout countReconnect="
              + countReconnect
              + " willReconnect="
              + willReconnect);
      if (willReconnect) {
        countReconnect = 0;
        reconnectListener.onReconnectRequired();
      }
      countReconnect++;
    }
  }

  public boolean isConnected() {
    return isConnected;
  }
}
