package com.brekeke.phonedev.lpc

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.ConnectivityManager
import android.net.Network
import android.os.Build
import android.os.IBinder
import android.util.Log
import com.brekeke.phonedev.MainActivity
import com.brekeke.phonedev.R
import com.brekeke.phonedev.utils.Emitter
import com.brekeke.phonedev.utils.L
import com.brekeke.phonedev.utils.MonitorConnection
import com.facebook.react.ReactApplication
import com.google.gson.Gson

// main lpc service

class BrekekeLpcService : Service() {
  companion object {
    var isServiceStarted = false
    var iService: Intent? = null
    private var cm: ConnectivityManager? = null
    var isReconnectByNetworkChange = false
    var con: MonitorConnection? = null
  }

  private var networkCallback: ConnectivityManager.NetworkCallback? = null
  private var isServiceNotiExist = false
  private var lpcReceiver: BrekekeLpcReceiver? = null

  override fun onCreate() {
    isServiceStarted = true
    createNotificationChannel()
    con = MonitorConnection()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    Log.d(LpcUtils.TAG, "onStartCommand called $isServiceStarted")
    reconnectLPC()
    if (isServiceNotiExist) return START_STICKY
    isServiceNotiExist = true
    val filter = IntentFilter(Intent.ACTION_SHUTDOWN)
    lpcReceiver = BrekekeLpcReceiver()
    registerReceiver(lpcReceiver, filter)

    val notificationIntent = Intent(this, MainActivity::class.java)
    val pendingIntent =
        PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE)
    val notification =
        Notification.Builder(this, LpcUtils.NOTI_CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(L.serviceIsRunning())
            .setContentText(L.serviceIsRunningInBackground())
            .setContentIntent(pendingIntent)
            .build()
    startForeground(1, notification)
    return START_STICKY
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val appName = getString(R.string.app_name)
      val serviceChannel =
          NotificationChannel(
              LpcUtils.NOTI_CHANNEL_ID,
              appName,
              NotificationManager.IMPORTANCE_DEFAULT,
          )
      serviceChannel.setShowBadge(false)
      val manager = getSystemService(NotificationManager::class.java)
      manager.createNotificationChannel(serviceChannel)
    }
  }

  fun createConnection(settings: LpcModel.Settings) {
    val sslSocketAsyncTask = BrekekeLpcSocket().SSLSocketAsyncTask(this)
    sslSocketAsyncTask.execute(settings)
  }

  override fun onBind(intent: Intent?): IBinder? {
    Log.d(LpcUtils.TAG, "onBind: execute")
    iService = intent
    registerNetworkCallback()
    Emitter.debug("[BrekekeLpcService] Start service when bind")
    startInService(intent!!)
    con!!.onConnected()
    return null
  }

  private fun startInService(intent: Intent) {
    val tlsKeyHash = intent.getStringExtra("tlsKeyHash")
    val port = intent.getIntExtra("port", 0)
    val host = intent.getStringExtra("host")
    val token = intent.getStringExtra("token")
    val username = intent.getStringExtra("username")
    val remoteSsids = intent.getStringArrayListExtra("remoteSsids")
    val settings = LpcModel().Settings(host, port, tlsKeyHash ?: "", token, username, remoteSsids)
    val gson = Gson()
    LpcUtils.writeConfig(this, gson.toJson(settings))
    createConnection(settings)
  }

  private fun stopLPCService(ctx: Context) {
    iService?.let { ctx.stopService(it) }
  }

  override fun onDestroy() {
    isServiceStarted = false
    Log.d(LpcUtils.TAG, "service destroy")
    Emitter.debug("[BrekekeLpcService] Service destroy")
    stopForeground(true)
    lpcReceiver?.let {
      try {
        unregisterReceiver(it)
      } catch (_: IllegalArgumentException) {}
      lpcReceiver = null
    }
    LpcUtils.writeConfig(this, "")
  }

  override fun onUnbind(intent: Intent?): Boolean {
    stopLPCService(this)
    clearNetworkCallback()
    con!!.cancelTimer()
    isServiceNotiExist = false
    return super.onUnbind(intent)
  }

  private fun registerNetworkCallback() {
    cm = getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
    cm?.registerDefaultNetworkCallback(
        object : ConnectivityManager.NetworkCallback() {
              override fun onAvailable(network: Network) {
                super.onAvailable(network)
                Emitter.debug("[BrekekeLpcService] Connection available")
                if (isReconnectByNetworkChange) {
                  reconnectLPC()
                  isReconnectByNetworkChange = false
                }
              }

              override fun onLost(network: Network) {
                super.onLost(network)
                isServiceStarted = false
                Emitter.debug("[BrekekeLpcService] Connection lost")
                isReconnectByNetworkChange = true
              }
            }
            .also { networkCallback = it }
    )
  }

  private fun clearNetworkCallback() {
    if (cm != null && networkCallback != null) {
      cm!!.unregisterNetworkCallback(networkCallback!!)
      cm = null
      networkCallback = null
    }
  }

  fun reconnectLPC() {
    val intent =
        iService
            ?: run {
              Emitter.debug("[BrekekeLpcService] Service intent is null")
              return
            }
    if (!isServiceStarted) {
      if (LpcUtils.checkAppInBackground()) {
        Log.d(LpcUtils.TAG, "[BrekekeLpcService] create React Context In Background")
        LpcUtils.createReactContextInBackground(applicationContext as ReactApplication)
        con!!.onConnected()
      }
      startInService(intent)
      isServiceStarted = true
      Emitter.debug("[BrekekeLpcService] Start service when network is available")
    }
  }
}
