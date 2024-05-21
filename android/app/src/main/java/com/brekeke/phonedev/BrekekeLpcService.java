package com.brekeke.phonedev;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import androidx.annotation.Nullable;

public class BrekekeLpcService extends Service {
  private static String TAG = "[BrekekeLpcService]";

  private String CHANNEL_ID = "NOTIFICATION_CHANNEL";

  public static boolean isServiceStarted = false;

  public static  LPCModel.Settings settings;

  @Override
  public void onCreate() {
    isServiceStarted = true;
    createNotificationChannel();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    Log.d(TAG, "onStartCommand called");


    Intent notificationIntent = new Intent(this, MainActivity.class);
    PendingIntent pendingIntent =
        PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);
    Notification notification =
        new Notification.Builder(this, CHANNEL_ID)
            .setContentTitle("Service is Running")
            .setContentText("Service running in background")
            .setSmallIcon(R.drawable.exo_notification_small_icon)
            .setContentIntent(pendingIntent)
            .build();

    startForeground(1, notification);
//    createConnection(settings);
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

  private void createConnection(LPCModel.Settings settings) {
    BrekekeSSLSocket.SSLSocketAsyncTask sslSocketAsyncTask =
        new BrekekeSSLSocket().new SSLSocketAsyncTask(this);
    sslSocketAsyncTask.execute(settings);
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    String tlsKeyHash = intent.getStringExtra("tlsKeyHash");
    int port = intent.getIntExtra("port", 0);
    String host = intent.getStringExtra("host");
    String token = intent.getStringExtra("token");
    String username = intent.getStringExtra("username");

    Log.d(TAG + "token", token);

    this.settings = new LPCModel().new Settings(host, port, tlsKeyHash, token, username);
    this.createConnection(settings);
    return null;
  }

  @Override
  public void onDestroy() {
    isServiceStarted = false;
    Log.d(TAG, "service done");
    stopForeground(true);
  }
}
