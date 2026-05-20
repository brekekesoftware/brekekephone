package com.brekeke.phonedev.activity

import android.Manifest.permission
import android.app.Activity
import android.app.KeyguardManager
import android.content.DialogInterface
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build.VERSION
import android.os.Build.VERSION_CODES
import android.os.Bundle
import android.provider.Settings
import android.text.TextUtils
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.RelativeLayout
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.swiperefreshlayout.widget.CircularProgressDrawable
import com.brekeke.phonedev.BrekekeUtils
import com.brekeke.phonedev.BuildConfig
import com.brekeke.phonedev.MainActivity
import com.brekeke.phonedev.MainApplication
import com.brekeke.phonedev.R
import com.brekeke.phonedev.utils.Emitter
import com.brekeke.phonedev.utils.L
import com.brekeke.phonedev.utils.PN
import com.brekeke.phonedev.utils.Ringtone
import com.brekeke.phonedev.utils.Toast
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.facebook.react.ReactRootView
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import io.wazo.callkeep.RNCallKeepModule
import java.util.Timer
import java.util.TimerTask
import org.json.JSONObject

// incoming call screen
open class IncomingCallActivity : Activity(), View.OnClickListener {
  private var reactRootView: ReactRootView? = null
  lateinit var vReactContainer: FrameLayout
  private lateinit var vToast: LinearLayout

  fun toast(m: String, d: String?, t: String) = Toast.show(vToast, m, d, t)

  lateinit var vIncomingCall: RelativeLayout
  lateinit var vHeaderIncomingCall: RelativeLayout
  lateinit var vWebViewAvatarLoading: RelativeLayout
  lateinit var vCardAvatar: View
  lateinit var imgAvatar: ImageView
  lateinit var imgAvatarLoadingProgress: CircularProgressDrawable
  lateinit var webViewAvatar: WebView
  lateinit var btnAnswer: Button
  lateinit var btnReject: Button
  lateinit var txtCallerName: TextView
  lateinit var txtIncomingCall: TextView
  lateinit var txtConnectionStatus: TextView

  var data: Map<String, String>? = null
  var uuid: String? = null
  var callerName: String? = null
  var avatar: String? = null
  var avatarSize: String? = null
  var talkingAvatar: String? = null
  var ringtone: String? = null
  var username: String? = null
  var tenant: String? = null
  var host: String? = null
  var port: String? = null
  var destroyed = false
  var paused = false
  var answered = false
  var autoAnswer = false

  var pbxConfig: JSONObject? = null
  var callConfig: JSONObject? = null
  val PERMISSIONS_REQUEST_CODE = 1222

  fun updateConnectionStatus(msg: String, isFailure: Boolean) {
    if (msg.isEmpty()) {
      txtConnectionStatus.visibility = View.GONE
      return
    }
    txtConnectionStatus.visibility = View.VISIBLE
    txtConnectionStatus.text = msg
    if (isFailure) {
      txtConnectionStatus.setBackgroundColor(getColor(R.color.toast_error))
    } else {
      txtConnectionStatus.setBackgroundColor(getColor(R.color.toast_warning))
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    var b = intent.extras ?: savedInstanceState
    if (b == null) {
      error("onCreate", "bundle=null")
      forceFinish()
      return
    }
    @Suppress("UNCHECKED_CAST")
    data = b.getSerializable("data") as? Map<String, String>
    if (data == null) {
      error("onCreate", "data=null")
      forceFinish()
      return
    }
    timer = Timer()
    uuid = data!!["callkeepUuid"]
    callerName = PN.callerName(data!!)
    avatar = PN.avatar(data!!)
    avatarSize = PN.avatarSize(data!!)
    ringtone = PN.ringtone(data!!)
    username = PN.username(data!!)
    tenant = PN.tenant(data!!)
    host = PN.host(data!!)
    port = PN.port(data!!)
    autoAnswer = BrekekeUtils.toBoolean(PN.autoAnswer(data!!))

    if ("rejectCall" == BrekekeUtils.userActions[uuid]) {
      debug("onCreate rejectCall")
      forceFinish()
      RNCallKeepModule.staticEndCall(uuid, this)
      return
    }
    BrekekeUtils.intervalCheckRejectCall(uuid!!)

    window.addFlags(
        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
    )

    setContentView(R.layout.incoming_call_activity)
    BrekekeUtils.activities.add(this)
    if (!autoAnswer) {
      Ringtone.play(ringtone, username, tenant, host, port)
    }

    vToast = findViewById(R.id.toast_container)

    imgAvatarLoadingProgress = CircularProgressDrawable(this)
    imgAvatarLoadingProgress.setColorSchemeColors(R.color.black, R.color.black, R.color.black)
    imgAvatarLoadingProgress.centerRadius = 30f
    imgAvatarLoadingProgress.strokeWidth = 5f
    imgAvatarLoadingProgress.start()

    vHeaderIncomingCall = findViewById(R.id.header_incoming)
    vIncomingCall = findViewById(R.id.view_incoming_call)
    vWebViewAvatarLoading = findViewById(R.id.rl_webview_loading)
    vCardAvatar = findViewById(R.id.card_avatar)

    webViewAvatar = findViewById(R.id.avatar_html)
    webViewAvatar.setBackgroundColor(Color.WHITE)
    webViewAvatar.settings.builtInZoomControls = false
    webViewAvatar.settings.setSupportZoom(true)
    webViewAvatar.settings.javaScriptCanOpenWindowsAutomatically = true
    webViewAvatar.settings.javaScriptEnabled = true
    webViewAvatar.settings.allowFileAccess = true
    webViewAvatar.settings.domStorageEnabled = true
    if (BrekekeUtils.isUserAgentConfig()) {
      webViewAvatar.settings.userAgentString = BrekekeUtils.userAgentConfig
    }

    imgAvatar = findViewById(R.id.avatar)
    btnAnswer = findViewById(R.id.btn_answer)
    btnReject = findViewById(R.id.btn_reject)

    btnAnswer.setOnClickListener(this)
    btnReject.setOnClickListener(this)

    txtCallerName = findViewById(R.id.txt_caller_name)
    txtIncomingCall = findViewById(R.id.txt_incoming_call)
    txtConnectionStatus = findViewById(R.id.txt_conection_status)

    txtCallerName.text = callerName
    txtConnectionStatus.setOnClickListener(this)

    updateLabels()
    if (autoAnswer) {
      handleClickAnswerCall()
    } else {
      updateHeader()
    }
    updateCallConfig()

    vReactContainer = findViewById(R.id.react_root_container)
  }

  override fun onNewIntent(intent: Intent) {
    debug("onNewIntent")
    super.onNewIntent(intent)
  }

  override fun onPause() {
    debug("onPause")
    paused = true
    super.onPause()
  }

  override fun onResume() {
    super.onResume()
    debug("onResume answered=$answered")
    Emitter.emit("onResume", "")
    if (!answered) {
      Ringtone.play(ringtone, username, tenant, host, port)
    } else {
      Emitter.emit("switchCall", uuid!!)
    }
    paused = false
  }

  override fun onDestroy() {
    debug("onDestroy")
    destroyAvatarWebView()
    destroyed = true
    try {
      timer?.cancel()
      timerTask?.cancel()
    } catch (_: Exception) {}
    timerTask = null
    timer = null
    reactRootView?.let {
      it.unmountReactApplication()
      reactRootView = null
    }
    BrekekeUtils.onActivityDestroy(uuid!!)
    onBtnRejectClick(null)
    super.onDestroy()
  }

  fun openMainActivity() {
    val i = Intent(this, MainActivity::class.java)
    if (BrekekeUtils.main != null) {
      i.flags = Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
    } else {
      i.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_MULTIPLE_TASK
    }
    startActivity(i)
  }

  override fun onBackPressed() {
    debug("onBackPressed")
    Emitter.emit("onIncomingCallActivityBackPressed", "")
    openMainActivity()
  }

  fun setUserAgentConfig(userAgent: String) {
    if (userAgent.isNotEmpty()) {
      webViewAvatar.settings.userAgentString = userAgent
    }
    if (
        webViewAvatar.visibility == View.VISIBLE &&
            avatar != null &&
            !BrekekeUtils.isImageUrl(avatar!!)
    ) {
      webViewAvatar.loadUrl(avatar!!)
    }
  }

  open fun updateEnableSwitchCall(isEnabled: Boolean) {}

  open fun updateBtnRqStatus(name: String, isLoading: Boolean) {}

  open fun updateCallConfig() {}

  fun destroyAvatarWebView() {
    try {
      webViewAvatar.settings.javaScriptEnabled = false
      webViewAvatar.destroy()
    } catch (e: Exception) {
      error("destroyAvatarWebView", e.message)
    }
  }

  fun updateHeader() {
    if ("large".equals(avatarSize, ignoreCase = true)) {
      val displayMetrics = android.util.DisplayMetrics()
      windowManager.defaultDisplay.getMetrics(displayMetrics)
      val height = (displayMetrics.heightPixels * 4 / 10)
      vCardAvatar.layoutParams.height = height
      vCardAvatar.layoutParams.width = height
      val shape = GradientDrawable()
      shape.cornerRadius = 0f
      vCardAvatar.background = shape
      vCardAvatar.setBackgroundColor(Color.WHITE)
      val params =
          RelativeLayout.LayoutParams(
              RelativeLayout.LayoutParams.MATCH_PARENT,
              RelativeLayout.LayoutParams.WRAP_CONTENT,
          )
      params.setMargins(0, (height * 1.5).toInt(), 0, 0)
      txtIncomingCall.layoutParams = params
    }
    if (TextUtils.isEmpty(avatar)) {
      vCardAvatar.layoutParams.height = 0
    } else if (!BrekekeUtils.isImageUrl(avatar!!)) {
      webViewAvatar.visibility = View.VISIBLE
      imgAvatar.visibility = View.GONE
      vWebViewAvatarLoading.visibility = View.VISIBLE
      webViewAvatar.webViewClient =
          object : WebViewClient() {
            override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
              super.onPageStarted(view, url, favicon)
            }

            override fun onPageFinished(view: WebView, url: String) {
              super.onPageFinished(view, url)
              vWebViewAvatarLoading.visibility = View.GONE
            }
          }
      if (BrekekeUtils.userAgentConfig != null) {
        webViewAvatar.loadUrl(avatar!!)
      }
    } else {
      webViewAvatar.visibility = View.GONE
      imgAvatar.visibility = View.VISIBLE
      Glide.with(this)
          .load(avatar)
          .diskCacheStrategy(DiskCacheStrategy.NONE)
          .skipMemoryCache(true)
          .placeholder(imgAvatarLoadingProgress)
          .error(R.mipmap.avatar_failed)
          .centerCrop()
          .into(imgAvatar)
    }
  }

  fun updateLabels() {
    txtIncomingCall.text = L.incomingCall()
  }

  open fun initWebrtcVideo() {}

  open fun updateDisplayVideo(isVideoCall: Boolean) {}

  open fun setRemoteVideoStreamUrl(url: String) {}

  open fun setRemoteStreams(streams: ReadableArray) {}

  open fun addStreamToView(stream: ReadableMap) {}

  open fun removeStreamFromView(vId: String) {}

  open fun setStreamActive(stream: ReadableMap) {}

  fun updateStreamActive(vId: String, streamUrl: String) {
    Emitter.emit("updateStreamActive", vId)
  }

  open fun setLocalStream(streamUrl: String) {}

  fun onBtnSwitchCamera(v: View) {
    Emitter.emit("switchCamera", uuid!!)
  }

  open fun toggleCallManageControls() {}

  open fun showCallManageControls() {}

  open fun hideCallManageControls() {}

  open fun updateLayoutManagerCall() {}

  open fun updateLayoutManagerCallLoading() {}

  open fun updateLayoutManagerCallLoaded() {}

  open fun handleShowAvatarTalking() {}

  private fun showRequestPermissions() {
    val builder = AlertDialog.Builder(this)
    builder.setTitle(L.titlePermissionMicroCamera())
    builder.setMessage(L.messagePermissionMicroCamera())
    builder.setCancelable(false)
    builder.setPositiveButton(L.close()) { _: DialogInterface, _: Int -> }
    builder.setNegativeButton(L.goToSetting()) { _: DialogInterface, _: Int ->
      val i =
          Intent(
              Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
              Uri.fromParts("package", BuildConfig.APPLICATION_ID, null),
          )
      i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      startActivity(i)
    }
    builder.create().show()
  }

  private fun checkAndRequestPermissions(): Boolean {
    if (
        checkSelfPermission(permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED &&
            checkSelfPermission(permission.CAMERA) == PackageManager.PERMISSION_GRANTED &&
            checkSelfPermission(permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
    )
        return true
    if (
        shouldShowRequestPermissionRationale(permission.RECORD_AUDIO) ||
            shouldShowRequestPermissionRationale(permission.CAMERA) ||
            shouldShowRequestPermissionRationale(permission.BLUETOOTH_CONNECT)
    ) {
      showRequestPermissions()
      return false
    }
    requestPermissions(
        arrayOf(permission.RECORD_AUDIO, permission.CAMERA, permission.BLUETOOTH_CONNECT),
        PERMISSIONS_REQUEST_CODE,
    )
    return false
  }

  fun handleResultPermForCall(r: IntArray) {
    if (r.size >= 3) {
      var bluetooth = PackageManager.PERMISSION_GRANTED
      if (VERSION.SDK_INT >= VERSION_CODES.S) bluetooth = r[2]
      if (
          r[0] == PackageManager.PERMISSION_GRANTED &&
              r[1] == PackageManager.PERMISSION_GRANTED &&
              bluetooth == PackageManager.PERMISSION_GRANTED
      ) {
        handleClickAnswerCall()
      } else {
        showRequestPermissions()
        val detail = "audio=${r[0]} camera=${r[1]} bluetooth=$bluetooth"
        debug("PERMISSIONS_REQUEST_CODE $detail")
      }
    }
  }

  override fun onRequestPermissionsResult(code: Int, permissions: Array<String>, r: IntArray) {
    super.onRequestPermissionsResult(code, permissions, r)
    if (code == PERMISSIONS_REQUEST_CODE) handleResultPermForCall(r)
  }

  private fun handleClickAnswerCall() = setCallAnswered()

  fun onBtnAnswerClick(v: View?) {
    if (answered) return
    if (checkAndRequestPermissions()) handleClickAnswerCall()
  }

  fun onBtnRejectClick(v: View?) {
    BrekekeUtils.putUserActionRejectCall(uuid!!)
    Emitter.emit("rejectCall", "CalleeClickReject-$uuid")
    answered = false
    BrekekeUtils.remove(uuid!!)
  }

  fun onBtnChatClick(v: View) {
    Emitter.emit("navChat", uuid!!)
    openMainActivity()
  }

  open fun onViewCallManageClick(v: View) {}

  fun onBtnUnlockClick(v: View) {
    Emitter.emit("showBackgroundCall", uuid!!)
    openMainActivity()
  }

  fun onBtnBackPress(v: View) = onBackPressed()

  fun onBtnTransferClick(v: View) {
    Emitter.emit("transfer", uuid!!)
    openMainActivity()
  }

  fun onBtnParkClick(v: View) {
    Emitter.emit("park", uuid!!)
    openMainActivity()
  }

  fun onBtnVideoClick(v: View) = Emitter.emit("video", uuid!!)

  fun onBtnSpeakerClick(v: View) = Emitter.emit("speaker", uuid!!)

  fun onBtnMuteClick(v: View) = Emitter.emit("mute", uuid!!)

  fun onBtnRecordClick(v: View) = Emitter.emit("record", uuid!!)

  fun onBtnDtmfClick(v: View) {
    Emitter.emit("dtmf", uuid!!)
    openMainActivity()
  }

  fun onBtnHoldClick(v: View) = Emitter.emit("hold", uuid!!)

  fun onRequestUnlock(v: View?) {
    if (!BrekekeUtils.isLocked()) {
      onKeyguardDismissSucceeded(v)
      return
    }
    BrekekeUtils.km!!.requestDismissKeyguard(
        this,
        object : KeyguardManager.KeyguardDismissCallback() {
          override fun onDismissSucceeded() {
            super.onDismissSucceeded()
            onKeyguardDismissSucceeded(v)
          }
        },
    )
  }

  fun onKeyguardDismissSucceeded(v: View?) {
    if (v == null) return
    when (v.id) {
      R.id.btn_answer -> onBtnAnswerClick(v)
      R.id.btn_reject -> onBtnRejectClick(v)
      R.id.txt_conection_status -> onConnectionStatusClick(v)
    }
  }

  fun onConnectionStatusClick(v: View) = Emitter.emit("connectionRequest", "")

  override fun onClick(v: View) {
    when (v.id) {
      R.id.btn_answer -> onBtnAnswerClick(v)
      R.id.btn_reject -> onBtnRejectClick(v)
      R.id.txt_conection_status -> onRequestUnlock(v)
    }
  }

  private fun mountReactView() {
    if (reactRootView != null) return
    val instanceManager = (application as MainApplication).reactNativeHost.reactInstanceManager
    reactRootView = ReactRootView(this)
    val props = Bundle()
    props.putString("uuid", uuid)
    reactRootView!!.startReactApplication(instanceManager, "IncomingCall", props)
    vReactContainer.addView(reactRootView)
    vReactContainer.visibility = View.VISIBLE
  }

  private fun setCallAnswered() {
    answered = true
    BrekekeUtils.putUserActionAnswerCall(uuid!!)
    Emitter.emit("answerCall", uuid!!)
    Ringtone.stop()
    vIncomingCall.visibility = View.GONE
    vHeaderIncomingCall.visibility = View.GONE
    destroyAvatarWebView()
    mountReactView()
  }

  fun onCallConnected() {
    if (!answered) setCallAnswered()
    startTimer(System.currentTimeMillis())
  }

  open fun disableAvatarTalking() {}

  open fun enableAvatarTalking() {}

  open fun updateUILayoutManagerCall(isVideoCall: Boolean) {}

  open fun setBtnVideoSelected(isVideoCall: Boolean, isMuted: Boolean) {}

  open fun checkVideoLocalEnable() {}

  open fun setOptionsRemoteStream(arr: ReadableArray) {}

  open fun setBtnHoldSelected(holding: Boolean) {}

  open fun setBtnMuteSelected(isMute: Boolean) {}

  open fun setBtnSpeakerSelected(isSpeakerOn: Boolean) {}

  open fun setImageTalkingUrl(url: String, isLarge: Boolean) {
    talkingAvatar = url
  }

  open fun setRecordingStatus(isRecording: Boolean) {}

  fun forceFinish() {
    destroyed = true
    try {
      finish()
    } catch (e: Exception) {
      error("forceFinish", e.message)
    }
  }

  fun finishRemoveTask() {
    destroyed = true
    try {
      finishAndRemoveTask()
    } catch (e: Exception) {
      error("finishRemoveTask", e.message)
    }
  }

  fun reorderToFront() {
    val i = Intent(this, IncomingCallActivity::class.java)
    i.flags = Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
    startActivity(i)
  }

  open fun updateBtnUnlockLabel() {}

  open fun updateMuteBtnLabel() {}

  open fun updateBtnHoldLabel() {}

  override fun dispatchKeyEvent(e: KeyEvent): Boolean {
    val k = e.keyCode
    val a = e.action
    debug("onKeyDown k=$k a=$a")
    Ringtone.stop()
    if (k == KeyEvent.KEYCODE_BACK || k == KeyEvent.KEYCODE_SOFT_LEFT) {
      if (a == KeyEvent.ACTION_DOWN) {
        if (BrekekeUtils.isLocked()) onRequestUnlock(null) else onBackPressed()
      }
      return true
    }
    return super.dispatchKeyEvent(e)
  }

  var timer: Timer? = null
  var timerTask: TimerTask? = null

  fun startTimer(answeredAt: Long) {
    if (timerTask != null) return
    timerTask =
        object : TimerTask() {
          override fun run() {}
        }
    timer!!.scheduleAtFixedRate(timerTask, 0, 1000)
  }

  fun getTimerText(ms: Long): String {
    var remaining = ms
    val os = 1000L
    val om = 60 * os
    val oh = 60 * om
    val h = Math.floor(remaining.toDouble() / oh).toLong()
    remaining %= oh
    val m = Math.floor(remaining.toDouble() / om).toLong()
    remaining %= om
    val s = Math.floor(remaining.toDouble() / os).toLong()
    return if (h != 0L) "%02d:".format(h) else "" + "%02d".format(m) + ":" + "%02d".format(s)
  }

  private fun debug(d: String) = Emitter.debug("IncomingCallActivity $callerName $d")

  private fun error(k: String, d: String?) = Emitter.error("IncomingCallActivity $callerName $k", d)
}
