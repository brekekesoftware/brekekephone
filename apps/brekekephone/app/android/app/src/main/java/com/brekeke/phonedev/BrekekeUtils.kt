package com.brekeke.phonedev

import android.Manifest.permission
import android.app.Activity
import android.app.KeyguardManager
import android.app.role.RoleManager
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Build.VERSION
import android.os.Build.VERSION_CODES
import android.os.PowerManager
import android.os.PowerManager.WakeLock
import android.os.SystemClock
import android.provider.CallLog
import android.telecom.TelecomManager
import android.text.TextUtils
import androidx.activity.result.ActivityResultLauncher
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat.checkSelfPermission
import com.brekeke.phonedev.activity.ExitActivity
import com.brekeke.phonedev.activity.IncomingCallActivity
import com.brekeke.phonedev.lpc.BrekekeLpcService
import com.brekeke.phonedev.lpc.LpcUtils
import com.brekeke.phonedev.push_notification.BrekekeMessagingService
import com.brekeke.phonedev.utils.Account
import com.brekeke.phonedev.utils.Ctx
import com.brekeke.phonedev.utils.Emitter
import com.brekeke.phonedev.utils.L
import com.brekeke.phonedev.utils.PN
import com.brekeke.phonedev.utils.Perm
import com.brekeke.phonedev.utils.Ringtone
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import io.wazo.callkeep.RNCallKeepModule
import io.wazo.callkeep.VoiceConnectionService
import java.net.URL
import java.text.SimpleDateFormat
import java.util.ArrayList
import java.util.Date
import java.util.HashMap
import java.util.Locale
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.regex.Pattern
import org.json.JSONObject

enum class DialerCheckState {
  IDLE,
  CHECKING,
  COMPLETED,
}

class BrekekeUtils(ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {

  init {
    Ctx.wakeFromMainRn(ctx)
    initStaticServices()
  }

  override fun initialize() {
    super.initialize()
    Emitter.init()
  }

  override fun getName() = "BrekekeUtils"

  companion object {
    var defaultDialerPromise: Promise? = null
    private const val TAG = "[BrekekeUtils]"

    var wl: WakeLock? = null

    // Dedup incoming call push notifications by compound key (pn-id + time)
    // Both LPC and FCM call onFcmMessageReceived() independently for the same call,
    // causing duplicate incoming call UI. This map tracks which key has been processed.
    // Using compound key (pn-id + time) instead of pn-id alone because pn-id resets
    // to 1,2,3... after PBX restart, but time is always different for each call.
    // Using ConcurrentHashMap because LPC runs on its socket thread while FCM runs on
    // FirebaseMessagingService thread — both can call onFcmMessageReceived() concurrently.
    // Cache is cleared on user logout via clearProcessedPnIds().
    private val processedPnIds = ConcurrentHashMap<String, Boolean>()

    fun acquireWakeLock() {
      if (wl?.isHeld == false) {
        Emitter.debug("calling wl.acquire()")
        wl!!.acquire()
      }
    }

    fun releaseWakeLock() {
      if (wl?.isHeld == true) {
        Emitter.debug("calling wl.release()")
        wl!!.release()
      }
    }

    var main: Activity? = null
    var defaultDialerLauncher: ActivityResultLauncher<Intent>? = null
    var dialerCheckState = DialerCheckState.IDLE

    var km: KeyguardManager? = null

    var isAppActive = false
    var isAppActiveLocked = false
    var firstShowCallAppActive = false
    var phoneappliEnabled = false
    var userAgentConfig: String? = null

    // [callkeepUuid] -> display/answerCall/rejectCall
    val userActions: MutableMap<String, String> = HashMap()

    fun initStaticServices() {
      val ctx = Ctx.app()!!
      if (wl == null) {
        val pm = ctx.getSystemService(Context.POWER_SERVICE) as PowerManager
        wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "BrekekePhone::BrekekeUtils")
      }
      if (km == null) {
        km = ctx.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
      }
    }

    fun putUserActionRejectCall(uuid: String) {
      try {
        userActions[uuid] = "rejectCall"
      } catch (_: Exception) {}
    }

    fun putUserActionAnswerCall(uuid: String) {
      try {
        userActions[uuid] = "answerCall"
      } catch (_: Exception) {}
    }

    fun isImageUrl(url: String): Boolean {
      if (url.lowercase().contains("/uc/image?action=download&tenant")) return true
      return try {
        val aURL = URL(url.lowercase())
        val p = Pattern.compile(".(jpeg|jpg|gif|png)$")
        val m = p.matcher(aURL.path)
        m.find()
      } catch (e: Exception) {
        e.printStackTrace()
        false
      }
    }

    // interval for the case js set rejectCall even before activity start/starting
    val destroyedUuids: MutableMap<String, String> = HashMap()

    fun intervalCheckRejectCall(uuid: String) {
      val h = Ctx.h()
      h.postDelayed(
          object : Runnable {
            private var elapsed = 0

            override fun run() {
              if ("rejectCall" == userActions[uuid]) remove(uuid)
              if (destroyedUuids.containsKey(uuid) || elapsed >= 60000) return
              elapsed += 1000
              h.postDelayed(this, 1000)
            }
          },
          1000,
      )
    }

    fun onFcmMessageReceived(m: Map<String, String>) {
      val pnId = PN.id(m) ?: return
      // skip default-dialer popup since we have an incoming call (BUG-1203)
      resultDefaultDialer("Skip during incoming call")
      // dedup by compound key: pn-id + time
      val time = PN.time(m)
      val dedupKey = if (time != null) "${pnId}_$time" else pnId
      if (processedPnIds.putIfAbsent(dedupKey, true) != null) {
        Emitter.debug("onFcmMessageReceived skip duplicate key=$dedupKey")
        return
      }
      if (Account.find(m) == null) {
        Emitter.error("onFcmMessageReceived", "account 404")
        processedPnIds.remove(dedupKey)
        return
      }
      val now = SimpleDateFormat("HH:mm:ss.SSS", Locale.getDefault()).format(Date())
      val mutableM = m.toMutableMap()
      mutableM["callkeepAt"] = now
      val uuid = UUID.randomUUID().toString().uppercase()
      mutableM["callkeepUuid"] = uuid
      initStaticServices()
      acquireWakeLock()
      val ctx = Ctx.app()!!
      RNCallKeepModule.registerPhoneAccount(ctx)
      val onShowIncomingCall = Runnable {
        val a = userActions[uuid]
        if (a != null) {
          if ("rejectCall" == a) RNCallKeepModule.staticEndCall(uuid, ctx)
          return@Runnable
        }
        userActions[uuid] = "display"
        activitiesSize++
        if (activitiesSize == 1) {
          firstShowCallAppActive = isAppActive || isAppActiveLocked
        }
        val i = Intent(ctx, IncomingCallActivity::class.java)
        i.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_MULTIPLE_TASK
        i.putExtra("data", HashMap(mutableM))
        ctx.startActivity(i)
      }
      if (
          activitiesSize > 0 &&
              activities.isEmpty() &&
              RNCallKeepModule.onShowIncomingCallUiCallbacks.isEmpty()
      ) {
        Emitter.debug(
            "onFcmMessageReceived: reset orphaned activitiesSize from $activitiesSize to 0"
        )
        activitiesSize = 0
      }
      if (
          VoiceConnectionService.currentConnections.size > 0 ||
              RNCallKeepModule.onShowIncomingCallUiCallbacks.size > 0 ||
              activitiesSize > 0
      ) {
        onShowIncomingCall.run()
      }
      RNCallKeepModule.onShowIncomingCallUiCallbacks[uuid] = onShowIncomingCall
      RNCallKeepModule.onRejectCallbacks[uuid] = Runnable { onPassiveReject(uuid) }
      RNCallKeepModule.staticDisplayIncomingCall(
          uuid,
          "Brekeke Phone",
          PN.callerName(mutableM),
          false,
          null,
      )
    }

    fun onPassiveReject(uuid: String) {
      Emitter.debug("onPassiveReject uuid=$uuid")
      Emitter.emit("rejectCall", uuid)
      staticCloseIncomingCall(uuid)
    }

    fun removeCallKeepCallbacks(uuid: String) {
      try {
        RNCallKeepModule.onShowIncomingCallUiCallbacks.remove(uuid)
      } catch (_: Exception) {}
      try {
        RNCallKeepModule.onRejectCallbacks.remove(uuid)
      } catch (_: Exception) {}
    }

    fun tryExitClearTask() {
      if (activities.isNotEmpty() || jsCallsSize > activitiesSize) return
      if (!firstShowCallAppActive) {
        try {
          main!!.moveTaskToBack(true)
        } catch (_: Exception) {}
      }
      if (main == null) {
        val ctx = Ctx.app()!!
        val i = Intent(ctx, ExitActivity::class.java)
        i.addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_CLEAR_TASK or
                Intent.FLAG_ACTIVITY_NO_ANIMATION or
                Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
        )
        ctx.startActivity(i)
      }
    }

    fun isLocked(): Boolean = km!!.isKeyguardLocked || km!!.isDeviceLocked

    val activities: ArrayList<IncomingCallActivity> = ArrayList()
    var activitiesSize = 0
    var jsCallsSize = 0

    fun remove(uuid: String) {
      removeCallKeepCallbacks(uuid)
      val a = at(uuid)
      Emitter.debug("remove a==null ${a == null}")
      if (a == null) return
      try {
        val i = index(uuid)
        if (i >= 0) activities.removeAt(i)
      } catch (_: Exception) {}
      if (activitiesSize == 1 && !a.answered) tryExitClearTask()
      try {
        a.forceFinish()
      } catch (_: Exception) {}
    }

    fun removeAll() {
      Emitter.debug("removeAll")
      Ringtone.stop()
      if (activities.isEmpty()) return
      var atLeastOneAnswerPressed = false
      try {
        for (a in activities) {
          atLeastOneAnswerPressed = atLeastOneAnswerPressed || a.answered
          a.forceFinish()
          removeCallKeepCallbacks(a.uuid!!)
        }
        activities.clear()
      } catch (_: Exception) {}
      if (!atLeastOneAnswerPressed) tryExitClearTask()
    }

    fun staticCloseIncomingCall(uuid: String) {
      Emitter.debug("staticCloseIncomingCall")
      try {
        at(uuid)!!.answered = false
      } catch (_: Exception) {}
      putUserActionRejectCall(uuid)
      remove(uuid)
    }

    private fun at(uuid: String): IncomingCallActivity? {
      return try {
        activities.firstOrNull { it.uuid == uuid }
      } catch (_: Exception) {
        null
      }
    }

    private fun index(uuid: String): Int {
      return try {
        activities.indexOfFirst { it.uuid == uuid }
      } catch (_: Exception) {
        -1
      }
    }

    fun anyCallAnswered(): Boolean {
      return try {
        activities.any { it.answered }
      } catch (_: Exception) {
        false
      }
    }

    private fun allCallsDestroyed(): Boolean {
      return try {
        activities.all { it.destroyed }
      } catch (_: Exception) {
        true
      }
    }

    fun onActivityDestroy(uuid: String) {
      activitiesSize--
      updateBtnUnlockLabels()
      try {
        destroyedUuids[uuid] = "destroyed"
      } catch (_: Exception) {}
      if (activitiesSize == 0 || anyCallAnswered() || allCallsDestroyed()) Ringtone.stop()
      if (activitiesSize == 0 && jsCallsSize == 0) releaseWakeLock()
    }

    fun updateBtnUnlockLabels() {
      try {
        for (a in activities) {
          try {
            a.updateBtnUnlockLabel()
          } catch (_: Exception) {}
        }
      } catch (_: Exception) {}
    }

    fun checkReadPhonePermission(): Boolean {
      val ctx = Ctx.app()!!
      return checkSelfPermission(ctx, permission.READ_PHONE_NUMBERS) ==
          PackageManager.PERMISSION_GRANTED
    }

    fun checkNotificationPermission(): Boolean {
      val ctx = Ctx.app()!!
      return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        checkSelfPermission(ctx, permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
      } else {
        NotificationManagerCompat.from(ctx).areNotificationsEnabled()
      }
    }

    fun resultDefaultDialer(msg: String) {
      dialerCheckState = DialerCheckState.COMPLETED
      resolveDefaultDialer(msg)
    }

    fun resolveDefaultDialer(msg: String) {
      if (defaultDialerPromise != null) {
        Emitter.debug("DefaultDialer resolved: $msg")
        defaultDialerPromise!!.resolve(msg)
        defaultDialerPromise = null
      }
    }

    fun checkDefaultDialer() {
      if (dialerCheckState == DialerCheckState.CHECKING) return
      if (dialerCheckState == DialerCheckState.COMPLETED) {
        resolveDefaultDialer("Already checked")
        return
      }
      // skip popup if there's an active call to avoid interrupting call UX (BUG-1203)
      if (jsCallsSize > 0 || activitiesSize > 0) {
        resolveDefaultDialer("Skip during active call")
        return
      }
      dialerCheckState = DialerCheckState.CHECKING
      if (VERSION.SDK_INT < VERSION_CODES.M || main == null) {
        resultDefaultDialer("Not supported on this Android version")
        return
      }
      val ctx = Ctx.app()!!
      val tm = ctx.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
      if (tm == null) {
        resultDefaultDialer("TelecomManager is null")
        return
      }
      val packageName = ctx.packageName
      if (packageName == tm.defaultDialerPackage) {
        resultDefaultDialer("Already the default dialer")
        return
      }
      val intent =
          Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER)
              .putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, packageName)
      if (intent.resolveActivity(ctx.packageManager) == null) {
        resultDefaultDialer("No activity to handle the intent")
        return
      }
      if (VERSION.SDK_INT < VERSION_CODES.Q) {
        defaultDialerLauncher!!.launch(intent)
      } else {
        val rm = main!!.getSystemService(RoleManager::class.java)
        if (rm != null && rm.isRoleAvailable(RoleManager.ROLE_DIALER)) {
          defaultDialerLauncher!!.launch(rm.createRequestRoleIntent(RoleManager.ROLE_DIALER))
        }
      }
    }

    fun toBoolean(s: String?): Boolean {
      if (TextUtils.isEmpty(s)) return false
      val l = s!!.lowercase()
      return l == "on" || l == "true" || l == "1" || l.toBooleanStrictOrNull() == true
    }

    fun isUserAgentConfig(): Boolean = userAgentConfig != null && userAgentConfig != ""
  }

  // ==========================================================================
  // react methods

  @ReactMethod fun permCheckOverlay(p: Promise) = p.resolve(Perm.check(Perm.Overlay))

  @ReactMethod fun permRequestOverlay(p: Promise) = Perm.request(Perm.Overlay, p)

  @ReactMethod
  fun permCheckIgnoringBatteryOptimizations(p: Promise) =
      p.resolve(Perm.check(Perm.IgnoringBatteryOptimizations))

  @ReactMethod
  fun permRequestIgnoringBatteryOptimizations(p: Promise) =
      Perm.request(Perm.IgnoringBatteryOptimizations, p)

  @ReactMethod fun permCheckAndroidLpc(p: Promise) = p.resolve(Perm.check(Perm.AndroidLpc))

  @ReactMethod fun permRequestAndroidLpc(p: Promise) = Perm.request(Perm.AndroidLpc, p)

  @ReactMethod
  fun permDefaultDialer(p: Promise) {
    defaultDialerPromise = p
    checkDefaultDialer()
  }

  @ReactMethod
  fun updateAnyHoldLoading(isAnyHoldLoading: Boolean) {
    UiThreadUtil.runOnUiThread {
      try {
        for (a in activities) {
          try {
            a.updateEnableSwitchCall(!isAnyHoldLoading)
          } catch (_: Exception) {}
        }
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun toast(uuid: String, m: String, d: String, t: String) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.toast(m, d, t)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun updateConnectionStatus(msg: String, isConnFailure: Boolean) {
    UiThreadUtil.runOnUiThread {
      try {
        for (a in activities) {
          try {
            a.updateConnectionStatus(msg, isConnFailure)
          } catch (_: Exception) {}
        }
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun updateRqStatus(uuid: String, name: String, isLoading: Boolean) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.updateBtnRqStatus(name, isLoading)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setUserAgentConfig(newUserAgentConfig: String) {
    if (userAgentConfig == null) {
      UiThreadUtil.runOnUiThread {
        try {
          for (a in activities) {
            try {
              a.setUserAgentConfig(newUserAgentConfig)
            } catch (e: Exception) {
              Emitter.error("a.setUserAgentConfig", e.message)
            }
          }
        } catch (e: Exception) {
          Emitter.error("setUserAgentConfig", e.message)
        }
      }
    }
    userAgentConfig = newUserAgentConfig
  }

  @ReactMethod
  fun getInitialNotifications(promise: Promise) =
      BrekekeMessagingService.getInitialNotifications(promise)

  @ReactMethod fun isLocked(p: Promise) = p.resolve(isLocked())

  @ReactMethod
  fun getRingtoneOptions(p: Promise) {
    try {
      p.resolve(Ringtone.options())
    } catch (e: Exception) {
      p.reject("RINGTONE_ERROR", "Failed to get ringtone options", e)
    }
  }

  @ReactMethod
  fun startRingtone(r: String?, u: String?, t: String?, h: String?, p: String?, promise: Promise) {
    val v = Ringtone.play(r, u, t, h, p)
    promise.resolve(v)
  }

  @ReactMethod
  fun validateRingtone(
      r: String?,
      u: String?,
      t: String?,
      h: String?,
      p: String?,
      promise: Promise,
  ) {
    var v = Ringtone.get(r, u, t, h, p)
    if (Ringtone._default == v) v = ""
    promise.resolve(v)
  }

  @ReactMethod
  fun stopRingtone(p: Promise) {
    Ringtone.stop()
    p.resolve(true)
  }

  @ReactMethod
  fun setAudioMode(mode: Int) {
    try {
      Ringtone.setAudioMode(mode)
    } catch (_: Exception) {}
  }

  @ReactMethod
  fun getRingerMode(p: Promise) {
    try {
      p.resolve(Ringtone.getRingerMode())
    } catch (e: Exception) {
      Emitter.error("getRingerMode", e.message)
      p.resolve(-1)
    }
  }

  @ReactMethod
  fun backToBackground() {
    try {
      main!!.moveTaskToBack(true)
    } catch (_: Exception) {}
  }

  @ReactMethod
  fun hasIncomingCallActivity(uuid: String, p: Promise) {
    try {
      p.resolve(at(uuid) != null)
    } catch (_: Exception) {
      p.resolve(false)
    }
  }

  @ReactMethod
  fun getIncomingCallPendingUserAction(uuid: String, p: Promise) = p.resolve(userActions[uuid])

  @ReactMethod
  fun closeIncomingCall(uuid: String) {
    Emitter.debug("closeIncomingCall uuid=$uuid")
    staticCloseIncomingCall(uuid)
  }

  @ReactMethod
  fun closeAllIncomingCalls() {
    Emitter.debug("closeAllIncomingCalls")
    removeAll()
  }

  @ReactMethod fun clearProcessedPnIds() = processedPnIds.clear()

  @ReactMethod
  fun setPbxConfig(jsonStr: String) {
    UiThreadUtil.runOnUiThread {
      try {
        if (!jsonStr.startsWith("{")) return@runOnUiThread
        val o = JSONObject(jsonStr)
        for (a in activities) {
          try {
            a.pbxConfig = o
            a.updateCallConfig()
          } catch (_: Exception) {}
        }
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setCallConfig(uuid: String, jsonStr: String) {
    UiThreadUtil.runOnUiThread {
      try {
        if (!jsonStr.startsWith("{")) return@runOnUiThread
        val a = at(uuid)!!
        a.callConfig = JSONObject(jsonStr)
        a.updateCallConfig()
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setIsAppActive(b1: Boolean, b2: Boolean) {
    isAppActive = b1
    isAppActiveLocked = b2
  }

  @ReactMethod
  fun setTalkingAvatar(uuid: String, url: String, isLarge: Boolean) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.setImageTalkingUrl(url, isLarge)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setJsCallsSize(n: Int) {
    if (n > 0) acquireWakeLock() else if (activitiesSize == 0) releaseWakeLock()
    jsCallsSize = n
    UiThreadUtil.runOnUiThread { updateBtnUnlockLabels() }
  }

  @ReactMethod
  fun setRecordingStatus(uuid: String, isRecording: Boolean) {
    Emitter.debug("setRecordingStatus uuid=$uuid isRecording=$isRecording")
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.setRecordingStatus(isRecording)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setIsVideoCall(uuid: String, isVideoCall: Boolean, isMuted: Boolean) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.setBtnVideoSelected(isVideoCall, isMuted)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setOnHold(uuid: String, holding: Boolean) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.setBtnHoldSelected(holding)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setIsMute(uuid: String, isMute: Boolean) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.setBtnMuteSelected(isMute)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setSpeakerStatus(isSpeakerOn: Boolean) {
    UiThreadUtil.runOnUiThread {
      try {
        for (a in activities) {
          try {
            a.setBtnSpeakerSelected(isSpeakerOn)
          } catch (_: Exception) {}
        }
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setLocale(locale: String) {
    L.set(locale)
    UiThreadUtil.runOnUiThread {
      try {
        for (a in activities) {
          try {
            a.updateLabels()
          } catch (_: Exception) {}
        }
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setPhoneappliEnabled(isEnabled: Boolean) {
    phoneappliEnabled = isEnabled
  }

  @ReactMethod
  fun onCallConnected(uuid: String) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.onCallConnected()
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun onCallKeepAction(uuid: String, action: String) {
    UiThreadUtil.runOnUiThread {
      try {
        if ("answerCall" == action) {
          val a = at(uuid)!!
          a.onBtnAnswerClick(null)
          a.reorderToFront()
        } else if ("rejectCall" == action) {
          at(uuid)!!.onBtnRejectClick(null)
        }
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun onPageCallManage(uuid: String) {
    UiThreadUtil.runOnUiThread {
      val toFront = at(uuid)
      Emitter.debug("onPageCallManage uuid=$uuid toFront==null ${toFront == null}")
      toFront?.reorderToFront()
    }
  }

  @ReactMethod
  fun insertCallLog(number: String, type: Int) {
    val ctx = Ctx.app()!!
    val v = ContentValues()
    v.put(CallLog.Calls.NUMBER, number)
    v.put(CallLog.Calls.DATE, System.currentTimeMillis())
    v.put(CallLog.Calls.TYPE, type)
    v.put(CallLog.Calls.CACHED_NAME, "Brekeke Phone")
    ctx.contentResolver.insert(CallLog.Calls.CONTENT_URI, v)
  }

  @ReactMethod
  fun systemUptimeMs(p: Promise) {
    try {
      p.resolve(SystemClock.elapsedRealtime().toDouble())
    } catch (_: Exception) {
      p.resolve(-1.0)
    }
  }

  @ReactMethod
  fun enableLPC(
      token: String,
      tokenVoip: String,
      username: String,
      host: String,
      port: Int,
      remoteSsids: ReadableArray,
      localSsid: String,
      tlsKeyHash: String,
  ) {
    val ctx = Ctx.app()!!
    val r = LpcUtils.convertReadableArrayToStringList(remoteSsids)
    val i =
        LpcUtils.putConfigToIntent(
            host,
            port,
            token,
            username,
            tlsKeyHash,
            r,
            Intent(ctx, BrekekeLpcService::class.java),
        )
    ctx.startForegroundService(i)
    ctx.bindService(i, LpcUtils.connection, Context.BIND_AUTO_CREATE)
    if (LpcUtils.LpcCallback.cb == null) {
      LpcUtils.LpcCallback.setLpcCallback(
          object : LpcUtils.LpcCallback.CallbackInterface {
            override fun getStateServer(b: Boolean) {
              if (!b) disableLPC()
            }
          }
      )
    }
  }

  @ReactMethod
  fun disableLPC() {
    try {
      if (BrekekeLpcService.isServiceStarted) {
        val ctx = Ctx.app()!!
        ctx.unbindService(LpcUtils.connection)
      }
    } catch (e: Exception) {
      Emitter.error("disableLPC", e.message)
    }
  }

  @ReactMethod
  fun setRemoteStreams(uuid: String, streams: ReadableArray) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.setRemoteStreams(streams)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setStreamActive(uuid: String, stream: ReadableMap) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.setStreamActive(stream)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setLocalStream(uuid: String, streamUrl: String) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.setLocalStream(streamUrl)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun addStreamToView(uuid: String, stream: ReadableMap) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.addStreamToView(stream)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun removeStreamFromView(uuid: String, vId: String) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.removeStreamFromView(vId)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setOptionsRemoteStream(uuid: String, arr: ReadableArray) {
    UiThreadUtil.runOnUiThread {
      try {
        at(uuid)!!.setOptionsRemoteStream(arr)
      } catch (_: Exception) {}
    }
  }

  @ReactMethod
  fun setShouldSkipPlayRingtone(s: Boolean) {
    Ringtone.shouldSkipPlayRingtone = s
  }

  @ReactMethod
  fun shouldPlayRingtone(p: Promise) {
    p.resolve(activities.isNotEmpty() && !anyCallAnswered())
  }
}
