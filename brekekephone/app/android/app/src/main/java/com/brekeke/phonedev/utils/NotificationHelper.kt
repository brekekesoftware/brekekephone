package com.brekeke.phonedev.utils

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.core.app.NotificationCompat
import com.brekeke.phonedev.MainActivity
import com.brekeke.phonedev.R
import java.util.Random

object NotificationHelper {
  private const val CHANNEL_ID = "brekeke_chat"
  private const val CHANNEL_NAME = "Chat Notifications"
  private const val TAG = "[NotificationHelper]"
  private const val RANDOM_MAX = 999_999_999

  fun showLocalPush(context: Context, title: String?, message: String?, data: Map<String, String>) {
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
    if (manager == null) {
      Log.e(TAG, "NotificationManager is null, cannot show notification.")
      return
    }
    ensureChannelExists(manager)

    val intent = Intent(context, MainActivity::class.java)
    intent.putExtra("pushNotification", mapToBundle(data))
    val notificationId = Random().nextInt(RANDOM_MAX)
    val pendingIntent =
        PendingIntent.getActivity(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    val notification =
        NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(message)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

    manager.notify(notificationId, notification)
    Log.d(TAG, "showLocalPush: Notification sent (id=$notificationId)")
  }

  private fun ensureChannelExists(manager: NotificationManager) {
    if (
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            manager.getNotificationChannel(CHANNEL_ID) == null
    ) {
      val channel =
          NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT)
      manager.createNotificationChannel(channel)
    }
  }

  private fun mapToBundle(map: Map<String, String>): Bundle {
    val bundle = Bundle()
    for ((key, value) in map) bundle.putString(key, value)
    return bundle
  }
}
