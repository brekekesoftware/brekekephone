package com.brekeke.phone.utils;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import com.brekeke.phone.MainActivity;
import com.brekeke.phone.R;
import java.util.Map;
import java.util.Random;

public final class NotificationHelper {

  private static final String CHANNEL_ID = "brekeke_chat";
  private static final String CHANNEL_NAME = "Chat Notifications";
  private static final String TAG = "[NotificationHelper]";
  private static final int RANDOM_MAX = 999_999_999;

  private NotificationHelper() {
    // Prevent instantiation
  }

  public static void showLocalPush(
      Context context, String title, String message, Map<String, String> data) {
    NotificationManager manager =
        (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    if (manager == null) {
      Log.e(TAG, "NotificationManager is null, cannot show notification.");
      return;
    }

    ensureChannelExists(manager);

    // Build intent to open app
    Intent intent = new Intent(context, MainActivity.class);
    intent.putExtra("pushNotification", mapToBundle(data));
    int notificationId = new Random().nextInt(RANDOM_MAX);
    PendingIntent pendingIntent =
        PendingIntent.getActivity(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

    Notification notification =
        new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(message)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build();

    manager.notify(notificationId, notification);

    Log.d(TAG, "showLocalPush: Notification sent (id=" + notificationId + ")");
  }

  private static void ensureChannelExists(@NonNull NotificationManager manager) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
        && manager.getNotificationChannel(CHANNEL_ID) == null) {
      NotificationChannel channel =
          new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT);
      manager.createNotificationChannel(channel);
    }
  }

  private static Bundle mapToBundle(@NonNull Map<String, String> map) {
    Bundle bundle = new Bundle();
    for (Map.Entry<String, String> entry : map.entrySet()) {
      bundle.putString(entry.getKey(), entry.getValue());
    }
    return bundle;
  }
}
