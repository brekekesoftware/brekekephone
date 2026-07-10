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
import com.brekeke.phonedev.utils.Ctx
import com.brekeke.phonedev.utils.Emitter
import com.brekeke.phonedev.utils.L
import com.brekeke.phonedev.utils.MonitorConnection
import com.facebook.react.ReactApplication
import com.google.gson.Gson
import java.util.concurrent.Executors

// main lpc service

class BrekekeLpcService : Service() {
  companion object {
    // volatile: written from RN thread (updateConfig/enableLPC) and read from main thread
    // (watchdog reconnectSocket) and executor thread (socket loop isServiceStarted check)
    @Volatile var isServiceStarted = false
    @Volatile var iService: Intent? = null
    @Volatile private var runningService: BrekekeLpcService? = null
    private var cm: ConnectivityManager? = null
    var isReconnectByNetworkChange = false
    var con: MonitorConnection? = null

    // Called from enableLPC when the service is already running to update config and reconnect
    // the socket without going through startForegroundService (which would re-post the
    // notification and regress BUG-1230). Returns false if the service is not running so the
    // caller falls back to the normal startForegroundService + bindService first-start path.
    //
    // If the intent carries the same config as the live socket (same-account app relaunch, e.g.
    // tapping a notification), skip the reconnect entirely so the working socket is not
    // interrupted.
    fun updateRunningConfig(intent: Intent): Boolean {
      val service = runningService ?: return false
      val i = iService
      if (i != null &&
          i.getStringExtra("host") == intent.getStringExtra("host") &&
          i.getIntExtra("port", 0) == intent.getIntExtra("port", 0) &&
          i.getStringExtra("username") == intent.getStringExtra("username") &&
          i.getStringExtra("token") == intent.getStringExtra("token") &&
          i.getStringExtra("tlsKeyHash") == intent.getStringExtra("tlsKeyHash")) {
        Emitter.debug("[BrekekeLpcService] Same config, skipping reconnect")
        return true
      }
      service.updateConfig(intent)
      return true
    }
  }

  private var networkCallback: ConnectivityManager.NetworkCallback? = null
  private var isServiceNotiExist = false
  private var lpcReceiver: BrekekeLpcReceiver? = null
  // BUG-1230: single owner of the LPC socket task — guarantees exactly one active socket and
  // lets us cancel/replace it on reconnect without restarting the foreground service
  private var currentSocketTask: BrekekeLpcSocket.SSLSocketAsyncTask? = null
  private val lpcExecutor = Executors.newSingleThreadExecutor()

  override fun onCreate() {
    isServiceStarted = true
    createNotificationChannel()
    con = MonitorConnection()
    // BUG-1230: watchdog reconnects the socket in-process instead of restarting the FGS
    con!!.setReconnectListener { reconnectSocket() }
    runningService = this
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    Log.d(LpcUtils.TAG, "onStartCommand called $isServiceStarted")
    reconnectLPC()

    // Android 14+ (target SDK 35) requires every startForegroundService() to be followed by
    // startForeground() within 5s, otherwise the system removes the notification and may demote
    // the service — so onStartCommand always (re)posts. BUG-1230: onStartCommand now only runs on
    // genuine (re)starts (first enableLPC, boot); the watchdog reconnects the socket in-process
    // and enableLPC skips startForegroundService while already running, so a user-swiped
    // notification is no longer re-posted on reconnect/relaunch. Notification ID is fixed so the
    // system updates in place.
    val notificationIntent = Intent(this, MainActivity::class.java)
    val pendingIntent =
        PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE)
    val notification =
        Notification.Builder(this, LpcUtils.NOTI_CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(L.serviceIsRunning())
            .setContentText(L.serviceIsRunningInBackground())
            // show the full body text when the user expands the notification, instead of
            // truncating it to a single line ("…")
            .setStyle(Notification.BigTextStyle().bigText(L.serviceIsRunningInBackground()))
            .setContentIntent(pendingIntent)
            // hide timestamp — Notification is rebuilt on every onStartCommand (watchdog
            // reconnect, process restart), and a fresh `when` would refresh the time shown
            // in the tray ("now") on every re-post, making the FGS look like a new alert
            .setShowWhen(false)
            .setOnlyAlertOnce(true)
            .build()
    startForeground(1, notification)

    if (isServiceNotiExist) return START_STICKY
    isServiceNotiExist = true
    // register action shutdown (only once for the lifetime of this service instance)
    val filter = IntentFilter(Intent.ACTION_SHUTDOWN)
    lpcReceiver = BrekekeLpcReceiver()
    registerReceiver(lpcReceiver, filter)
    return START_STICKY
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val appName = getString(R.string.app_name)
      val serviceChannel =
          NotificationChannel(
              LpcUtils.NOTI_CHANNEL_ID,
              appName,
              NotificationManager.IMPORTANCE_LOW,
          )
      serviceChannel.setShowBadge(false)
      serviceChannel.setSound(null, null)
      val manager = getSystemService(NotificationManager::class.java)
      manager.createNotificationChannel(serviceChannel)
      // cleanup the old IMPORTANCE_DEFAULT channel for users upgrading from < 2.17.8, so it
      // doesn't linger unused in Settings -> Apps -> Brekeke Phone -> Notifications
      manager.deleteNotificationChannel("NOTIFICATION_CHANNEL")
    }
  }

  fun createConnection(settings: LpcModel.Settings) {
    // BUG-1230: confine socket task swaps to the main thread so there is always exactly one
    // active socket; cancel/close the previous task (even if parked in select()) before
    // starting a new one, and run on a dedicated executor so a stuck task can't block reconnect
    Ctx.h().post {
      con!!.resetCadence()
      currentSocketTask?.shutdown()
      val task = BrekekeLpcSocket().SSLSocketAsyncTask(this)
      currentSocketTask = task
      task.executeOnExecutor(lpcExecutor, settings)
    }
  }

  // BUG-1230: watchdog asks for a socket-only reconnect. Restart the socket directly (no
  // startForegroundService -> no notification re-post) and DON'T touch isServiceStarted — the
  // service never stopped, only the socket is replaced. This also avoids a race where enableLPC
  // (on the RN thread) could observe a transient isServiceStarted=false and spuriously
  // startForegroundService. createConnection cancels the old (possibly parked) socket and
  // enforces a single active one.
  private fun reconnectSocket() {
    val i =
        iService
            ?: run {
              Emitter.debug("[BrekekeLpcService] Service intent is null")
              return
            }
    startInService(i)
  }

  private fun updateConfig(intent: Intent) {
    isServiceStarted = true
    Emitter.debug(
        "[BrekekeLpcService] Update service config while running username=${intent.getStringExtra("username")}"
    )
    startInService(intent)
    con!!.onConnected()
  }

  override fun onBind(intent: Intent?): IBinder? {
    Log.d(LpcUtils.TAG, "onBind: execute")
    registerNetworkCallback()
    Emitter.debug("[BrekekeLpcService] Start service when bind")
    startInService(intent!!)
    con!!.onConnected()
    return null
  }

  private fun startInService(intent: Intent) {
    iService = intent
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
    if (runningService === this) {
      runningService = null
    }
    // BUG-1230: explicitly cancel the socket (it may be parked in select() and would not
    // notice isServiceStarted=false on its own)
    currentSocketTask?.shutdown()
    currentSocketTask = null
    Log.d(LpcUtils.TAG, "service destroy")
    Emitter.debug("[BrekekeLpcService] Service destroy")
    stopForeground(true)
    // null static iService + stop watchdog so MonitorConnection cannot revive the service or
    // re-arm its timer after user-initiated stop. Without this, a lingering socket task's
    // onPostExecute -> con.onDisconnected -> resetTimer would keep the static watchdog ticking
    // forever (BUG-1230 review finding #1), and previously could resurrect the FGS, violating
    // Play Console "terminable by user" requirement.
    iService = null
    con?.stop()
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
