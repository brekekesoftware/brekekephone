package com.brekeke.phonedev.push_notification

import com.brekeke.phonedev.BrekekeUtils
import com.brekeke.phonedev.lpc.LpcUtils
import com.brekeke.phonedev.utils.Ctx
import com.brekeke.phonedev.utils.Emitter
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import com.facebook.react.bridge.WritableMap
import com.google.firebase.messaging.RemoteMessage
import com.wix.reactnativenotifications.fcm.FcmInstanceIdListenerService
import org.json.JSONArray

// custom push notification
class BrekekeMessagingService : FcmInstanceIdListenerService() {
  override fun onMessageReceived(m: RemoteMessage) {
    Ctx.wakeFromPn(this)

    if (!BrekekeUtils.checkNotificationPermission()) {
      Emitter.error("onMessageReceived", "!checkNotificationPermission")
      return
    }
    if (!BrekekeUtils.checkReadPhonePermission()) {
      Emitter.emit("phonePermission", "")
      Emitter.error("onMessageReceived", "!checkReadPhonePermission")
      return
    }

    BrekekeUtils.onFcmMessageReceived(m.data)
    Emitter.debug("[BrekekeMessagingService] Incoming call started by FCM")
    Emitter.debug(m.data.toString())

    if (initialNotifications == null) initialNotifications = ArrayList()
    try {
      initialNotifications!!.add(ReactNativeJson.convertMapToJson(parse(m)).toString())
    } catch (e: Exception) {
      Emitter.error("initialNotifications.add", e.message)
    }

    val m2 =
        RemoteMessage.Builder(m.from!!)
            .setMessageId(m.messageId!!)
            .setTtl(m.ttl)
            .setData(m.data)
            .build()
    super.onMessageReceived(m2)

    val r = application as ReactApplication
    runOnUiThread { LpcUtils.createReactContextInBackground(r) }
  }

  companion object {
    private var initialNotifications: ArrayList<String>? = null

    fun getInitialNotifications(p: Promise) {
      if (initialNotifications == null) {
        p.resolve(null)
        return
      }
      try {
        val arr = initialNotifications!!.toTypedArray()
        initialNotifications = null
        p.resolve(JSONArray(arr).toString())
      } catch (e: Exception) {
        p.resolve(null)
        Emitter.error("getInitialNotifications", e.message)
      }
    }

    private fun parse(m: RemoteMessage): WritableMap {
      val p = Arguments.createMap()
      p.putString("from", m.from)
      p.putString("google.message_id", m.messageId)
      p.putString("google.to", m.to)
      p.putDouble("google.sent_time", m.sentTime.toDouble())
      val d = m.data
      for (k in d.keys) p.putString(k, d[k])
      return p
    }
  }
}
