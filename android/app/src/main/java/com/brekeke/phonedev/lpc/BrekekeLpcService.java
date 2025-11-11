package com.brekeke.phonedev.lpc;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.Network;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.brekeke.phonedev.MainActivity;
import com.brekeke.phonedev.R;
import com.brekeke.phonedev.utils.Emitter;
import com.brekeke.phonedev.utils.L;
import com.brekeke.phonedev.utils.MonitorConnection;
import com.brekeke.phonedev.utils.NetworkUtils;
import com.facebook.react.ReactApplication;
import com.google.gson.Gson;
import java.util.ArrayList;

// main lpc service

public class BrekekeLpcService extends Service {
  public static boolean isServiceStarted = false;
  public static Intent iService;
  private static ConnectivityManager cm;
  private ConnectivityManager.NetworkCallback networkCallback;
  public static Boolean isReconnectByNetworkChange = false;
  public static MonitorConnection con;
  private Boolean isServiceNotiExist = false;

  @Override
  public void onCreate() {
    isServiceStarted = true;
    createNotificationChannel();
    con = new MonitorConnection();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    Log.d(LpcUtils.TAG, "onStartCommand called");
    reconnectLPC();
    if (isServiceNotiExist) {
      Emitter.debug("[BrekekeLpcService] Service notification exist");
      return START_STICKY;
    }
    isServiceNotiExist = true;
    Emitter.debug("[BrekekeLpcService] Service notication created");
    // register action shutdown
    IntentFilter filter = new IntentFilter(Intent.ACTION_SHUTDOWN);
    registerReceiver(new BrekekeLpcReceiver(), filter);

    Intent notificationIntent = new Intent(this, MainActivity.class);
    PendingIntent pendingIntent =
        PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);
    Notification notification =
        new Notification.Builder(this, LpcUtils.NOTI_CHANNEL_ID)
            // fix: the app will crash: "Invalid notification (no valid small icon)"
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(L.serviceIsRunning())
            .setContentText(L.serviceIsRunningInBackground())
            .setContentIntent(pendingIntent)
            .build();

    startForeground(1, notification);
    return START_STICKY;
  }

  private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      String appName = getString(R.string.app_name);
      NotificationChannel serviceChannel =
          new NotificationChannel(
              LpcUtils.NOTI_CHANNEL_ID, appName, NotificationManager.IMPORTANCE_DEFAULT);
      serviceChannel.setShowBadge(false);
      NotificationManager manager = getSystemService(NotificationManager.class);
      manager.createNotificationChannel(serviceChannel);
    }
  }

  public void createConnection(LpcModel.Settings settings) {
    BrekekeLpcSocket.SSLSocketAsyncTask sslSocketAsyncTask =
        new BrekekeLpcSocket().new SSLSocketAsyncTask(this);
    sslSocketAsyncTask.execute(settings);
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    Log.d(LpcUtils.TAG, "onBind: execute");
    iService = intent;
    registerNetworkCallback();
    var r = intent.getStringArrayListExtra("remoteSsids");
    if (r == null || r.isEmpty() || !NetworkUtils.matchSsid(getApplicationContext(), r)) {
      Emitter.debug("[BrekekeLpcService] Wifi not match");
      return null;
    }
    Emitter.debug("[BrekekeLpcService] Start service when bind");
    Log.d(LpcUtils.TAG, "[BrekekeLpcService]: Start service when bind");
    startInService(intent);
    con.onConnected();
    return null;
  }

  private void startInService(Intent intent) {
    String tlsKeyHash = intent.getStringExtra("tlsKeyHash");
    int port = intent.getIntExtra("port", 0);
    String host = intent.getStringExtra("host");
    String token = intent.getStringExtra("token");
    String username = intent.getStringExtra("username");
    ArrayList<String> remoteSsids = intent.getStringArrayListExtra("remoteSsids");
    var settings =
        new LpcModel().new Settings(host, port, tlsKeyHash, token, username, remoteSsids);
    Gson gson = new Gson();
    LpcUtils.writeConfig(this, gson.toJson(settings));
    createConnection(settings);
    Emitter.debug("[BrekekeLpcService] LPC connection begin");
    Log.d(LpcUtils.TAG, "[BrekekeLpcService]: LPC connection begin");
  }

  private static void stopLPCService(Context ctx) {
    if (iService != null) {
      ctx.stopService(iService);
    }
  }

  @Override
  public void onDestroy() {
    isServiceStarted = false;
    Log.d(LpcUtils.TAG, "service destroy");
    Emitter.debug("[BrekekeLpcService] Service destroy");
    stopForeground(true);
    // clear local config
    LpcUtils.writeConfig(this, "");
  }

  @Override
  public boolean onUnbind(Intent intent) {
    stopLPCService(this);
    clearNetworkCallback();
    con.cancelTimer();
    isServiceNotiExist = false;
    return super.onUnbind(intent);
  }

  private void registerNetworkCallback() {
    cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
    if (cm != null) {
      cm.registerDefaultNetworkCallback(
          networkCallback =
              new ConnectivityManager.NetworkCallback() {
                @Override
                public void onAvailable(@NonNull Network network) {
                  super.onAvailable(network);
                  if (isReconnectByNetworkChange) {
                    Emitter.debug("[BrekekeLpcService] Connection available");
                    iService.putExtra("reason", "LPC reconnect by network");
                    reconnectLPC();
                    isReconnectByNetworkChange = false;
                  }
                }

                @Override
                public void onLost(@NonNull Network network) {
                  super.onLost(network);
                  isServiceStarted = false;
                  Emitter.debug("[BrekekeLpcService] Connection lost");
                  isReconnectByNetworkChange = true;
                }
              });
    }
  }

  private void clearNetworkCallback() {
    if (cm != null && networkCallback != null) {
      cm.unregisterNetworkCallback(networkCallback);
      cm = null;
      networkCallback = null;
    }
  }

  public void reconnectLPC() {
    if (iService == null) {
      Emitter.debug("[BrekekeLpcService] Service intent is null");
      return;
    }
    Emitter.debug("[BrekekeLpcService] LPC reconnect reason: " + iService.getStringExtra("reason"));
    Log.d(LpcUtils.TAG, "reconnectLPC: reason " + iService.getStringExtra("reason"));
    if (con.isConnected()) {
      Emitter.debug("[BrekekeLpcService] LPC still connected");
      return;
    }
    // TODO
    //    var r = iService.getStringArrayListExtra("remoteSsids");
    //    if (r == null || r.isEmpty() || !NetworkUtils.matchSsid(getApplicationContext(), r)) {
    //      Emitter.debug("[BrekekeLpcService] Wifi not match");
    //      return;
    //    }
    if (!isServiceStarted) {
      if (LpcUtils.checkAppInBackground()) {
        Log.d(LpcUtils.TAG, "[BrekekeLpcService] create React Context In Background");
        LpcUtils.createReactContextInBackground((ReactApplication) getApplicationContext());
        con.onConnected();
      }
      startInService(iService);
      isServiceStarted = true;
      Emitter.debug("[BrekekeLpcService] Reconnect LPC");
      Log.d(LpcUtils.TAG, "[BrekekeLpcService] Reconnect LPC");
    }
  }
}
