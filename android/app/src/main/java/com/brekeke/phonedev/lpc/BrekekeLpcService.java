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
import com.brekeke.phonedev.utils.Ctx;
import com.brekeke.phonedev.utils.Emitter;
import com.brekeke.phonedev.utils.L;
import com.brekeke.phonedev.utils.MonitorConnection;
import com.facebook.react.ReactApplication;
import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

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
  // BUG-1230: single owner of the LPC socket task — guarantees exactly one active socket and
  // lets us cancel/replace it on reconnect without restarting the foreground service
  private BrekekeLpcSocket.SSLSocketAsyncTask currentSocketTask;
  private final Executor lpcExecutor = Executors.newSingleThreadExecutor();

  @Override
  public void onCreate() {
    isServiceStarted = true;
    createNotificationChannel();
    con = new MonitorConnection();
    // BUG-1230: watchdog reconnects the socket in-process instead of restarting the FGS
    con.setReconnectListener(this::reconnectSocket);
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    Log.d(LpcUtils.TAG, "onStartCommand called " + isServiceStarted);
    reconnectLPC();

    // Android 14+ (target SDK 35) requires every startForegroundService() to be followed by
    // startForeground() within 5s, otherwise the system removes the notification and may demote
    // the service — so onStartCommand always (re)posts. BUG-1230: onStartCommand now only runs on
    // genuine (re)starts (first enableLPC, boot); the watchdog reconnects the socket in-process
    // and enableLPC skips startForegroundService while already running, so a user-swiped
    // notification is no longer re-posted on reconnect/relaunch. Notification ID is fixed so the
    // system updates in place.
    Intent notificationIntent = new Intent(this, MainActivity.class);
    PendingIntent pendingIntent =
        PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);
    Notification notification =
        new Notification.Builder(this, LpcUtils.NOTI_CHANNEL_ID)
            // fix: the app will crash: "Invalid notification (no valid small icon)"
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(L.serviceIsRunning())
            .setContentText(L.serviceIsRunningInBackground())
            // show the full body text when the user expands the notification, instead of
            // truncating it to a single line ("…")
            .setStyle(new Notification.BigTextStyle().bigText(L.serviceIsRunningInBackground()))
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
      // cleanup the old IMPORTANCE_DEFAULT channel for users upgrading from < 2.17.8, so it
      // doesn't linger unused in Settings -> Apps -> Brekeke Phone -> Notifications
      manager.deleteNotificationChannel("NOTIFICATION_CHANNEL");
    }
  }

  public void createConnection(LpcModel.Settings settings) {
    // BUG-1230: confine socket task swaps to the main thread so there is always exactly one
    // active socket; cancel/close the previous task (even if parked in select()) before
    // starting a new one, and run on a dedicated executor so a stuck task can't block reconnect
    Ctx.h()
        .post(
            () -> {
              con.resetCadence();
              if (currentSocketTask != null) {
                currentSocketTask.shutdown();
              }
              BrekekeLpcSocket.SSLSocketAsyncTask task =
                  new BrekekeLpcSocket().new SSLSocketAsyncTask(this);
              currentSocketTask = task;
              task.executeOnExecutor(lpcExecutor, settings);
            });
  }

  // BUG-1230: watchdog asks for a socket-only reconnect. Restart the socket directly (no
  // startForegroundService -> no notification re-post) and DON'T touch isServiceStarted — the
  // service never stopped, only the socket is replaced. This also avoids a race where enableLPC
  // (on the RN thread) could observe a transient isServiceStarted=false and spuriously
  // startForegroundService. createConnection cancels the old (possibly parked) socket and
  // enforces a single active one.
  private void reconnectSocket() {
    if (iService == null) {
      Emitter.debug("[BrekekeLpcService] Service intent is null");
      return;
    }
    startInService(iService);
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
    // BUG-1230: explicitly cancel the socket (it may be parked in select() and would not
    // notice isServiceStarted=false on its own)
    if (currentSocketTask != null) {
      currentSocketTask.shutdown();
      currentSocketTask = null;
    }
    Log.d(LpcUtils.TAG, "service destroy");
    Emitter.debug("[BrekekeLpcService] Service destroy");
    stopForeground(true);
    // null static iService + stop watchdog so MonitorConnection cannot revive the service or
    // re-arm its timer after user-initiated stop. Without this, a lingering socket task's
    // onPostExecute -> con.onDisconnected -> resetTimer would keep the static watchdog ticking
    // forever (BUG-1230 review finding #1), and previously could resurrect the FGS, violating
    // Play Console "terminable by user" requirement.
    iService = null;
    if (con != null) {
      con.stop();
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
