package com.brekeke.phonedev.lpc;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import androidx.annotation.Nullable;
import com.brekeke.phonedev.MainActivity;
import com.brekeke.phonedev.R;
import com.brekeke.phonedev.utils.L;
import com.google.gson.Gson;

// main lpc service

public class BrekekeLpcService extends Service {
  private String CHANNEL_ID = "NOTIFICATION_CHANNEL";
  public static boolean isServiceStarted = false;
  public static LpcModel.Settings settings;
  private static Intent iService;

  @Override
  public void onCreate() {
    isServiceStarted = true;
    createNotificationChannel();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    Log.d(LpcUtils.TAG, "onStartCommand called");
    // register action shutdown
    IntentFilter filter = new IntentFilter(Intent.ACTION_SHUTDOWN);
    registerReceiver(new BrekekeLpcReceiver(), filter);

    Intent notificationIntent = new Intent(this, MainActivity.class);
    PendingIntent pendingIntent =
        PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);
    Notification notification =
        new Notification.Builder(this, CHANNEL_ID)
            .setContentTitle(L.serviceIsRunning())
            .setContentText(L.serviceIsRunningInBackground())
            .setSmallIcon(R.drawable.exo_notification_small_icon)
            .setContentIntent(pendingIntent)
            .build();

    startForeground(1, notification);
    return START_STICKY;
  }

  private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      String appName = getString(R.string.app_name);
      NotificationChannel serviceChannel =
          new NotificationChannel(CHANNEL_ID, appName, NotificationManager.IMPORTANCE_DEFAULT);
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
    startInService(intent);
    iService = intent;
    Log.d(LpcUtils.TAG, "onBind: execute");
    return null;
  }

  private void startInService(Intent intent) {
    String tlsKeyHash = intent.getStringExtra("tlsKeyHash");
    int port = intent.getIntExtra("port", 0);
    String host = intent.getStringExtra("host");
    String token = intent.getStringExtra("token");
    String username = intent.getStringExtra("username");
    settings = new LpcModel().new Settings(host, port, tlsKeyHash, token, username);
    Gson gson = new Gson();
    LpcUtils.writeConfig(this, gson.toJson(settings));
    createConnection(settings);
  }

  private static void stopLPCService(Context c) {
    if (iService != null) {
      c.stopService(iService);
    }
  }

  @Override
  public void onDestroy() {
    isServiceStarted = false;
    Log.d(LpcUtils.TAG, "service destroy");
    stopForeground(true);
    // clear local config
    LpcUtils.writeConfig(this, "");
  }

  @Override
  public boolean onUnbind(Intent intent) {
    stopLPCService(this);
    return super.onUnbind(intent);
  }
}
