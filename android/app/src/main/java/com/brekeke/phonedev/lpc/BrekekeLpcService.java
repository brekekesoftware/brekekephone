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
  // keep ref so onDestroy can unregister; otherwise each service restart leaks a receiver
  private BrekekeLpcReceiver lpcReceiver;

  @Override
  public void onCreate() {
    isServiceStarted = true;
    createNotificationChannel();
    con = new MonitorConnection();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    Log.d(LpcUtils.TAG, "onStartCommand called " + isServiceStarted);
    reconnectLPC();

    // Android 14+ (target SDK 35) requires every startForegroundService() to be followed by
    // startForeground() within 5s, otherwise the system removes the notification and may
    // demote the service. MonitorConnection's watchdog re-invokes startForegroundService on
    // silent socket death, so we must re-post the notification on every onStartCommand —
    // not just the first one. Notification ID is fixed so the system updates in place.
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
            // hide timestamp — Notification is rebuilt on every onStartCommand (watchdog
            // reconnect, process restart), and a fresh `when` would refresh the time shown
            // in the tray ("now") on every re-post, making the FGS look like a new alert
            .setShowWhen(false)
            .setOnlyAlertOnce(true)
            .build();
    startForeground(1, notification);

    if (isServiceNotiExist) {
      return START_STICKY;
    }
    isServiceNotiExist = true;
    // register action shutdown (only once for the lifetime of this service instance)
    IntentFilter filter = new IntentFilter(Intent.ACTION_SHUTDOWN);
    lpcReceiver = new BrekekeLpcReceiver();
    registerReceiver(lpcReceiver, filter);
    return START_STICKY;
  }

  private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      String appName = getString(R.string.app_name);
      NotificationChannel serviceChannel =
          new NotificationChannel(
              LpcUtils.NOTI_CHANNEL_ID, appName, NotificationManager.IMPORTANCE_LOW);
      serviceChannel.setShowBadge(false);
      serviceChannel.setSound(null, null);
      NotificationManager manager = getSystemService(NotificationManager.class);
      manager.createNotificationChannel(serviceChannel);
      // cleanup the old IMPORTANCE_DEFAULT channel for users upgrading from <2.17.9, so it
      // doesn't linger unused in Settings -> Apps -> Brekeke Phone -> Notifications
      manager.deleteNotificationChannel("NOTIFICATION_CHANNEL");
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
    Emitter.debug("[BrekekeLpcService] Start service when bind");
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
    // null static iService + cancel pending watchdog timer so MonitorConnection cannot
    // revive the service via startForegroundService(iService) after user-initiated stop.
    // Without this, a lingering socket task's onPostExecute -> con.onDisconnected -> timer
    // -> updateState sees iService != null and resurrects the FGS, violating Play Console
    // "terminable by user" requirement.
    iService = null;
    if (con != null) {
      con.cancelTimer();
    }
    // unregister BrekekeLpcReceiver to avoid IntentReceiverLeaked across destroy/recreate cycles,
    // which previously left dangling references and prevented clean LPC TLS reconnect on account
    // switch
    if (lpcReceiver != null) {
      try {
        unregisterReceiver(lpcReceiver);
      } catch (IllegalArgumentException ignored) {
        // receiver already unregistered (e.g. by system on process death)
      }
      lpcReceiver = null;
    }
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
                  Emitter.debug("[BrekekeLpcService] Connection available");
                  if (isReconnectByNetworkChange) {
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
    if (!isServiceStarted) {
      if (LpcUtils.checkAppInBackground()) {
        Log.d(LpcUtils.TAG, "[BrekekeLpcService] create React Context In Background");
        LpcUtils.createReactContextInBackground((ReactApplication) getApplicationContext());
        con.onConnected();
      }
      startInService(iService);
      isServiceStarted = true;
      Emitter.debug("[BrekekeLpcService] Start service when network is available");
    }
  }
}
