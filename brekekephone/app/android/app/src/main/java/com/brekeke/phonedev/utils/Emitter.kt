package com.brekeke.phonedev.utils

import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

object Emitter {
  private var ee: RCTDeviceEventEmitter? = null

  // should also be called in BrekekeUtils.initialize
  fun init() {
    if (ee != null) return
    val ctx = Ctx.rn() ?: return
    try {
      ee = ctx.getJSModule(RCTDeviceEventEmitter::class.java)
    } catch (_: Exception) {}
  }

  fun emit(k: String, d: String): Boolean = _emit(k, d)

  private fun _emit(k: String, d: String): Boolean {
    return try {
      ee!!.emit(k, d)
      true
    } catch (_: Exception) {
      false
    }
  }

  fun debug(d: String): Boolean = emit("debug", d)

  fun error(d: String): Boolean = emit("error", d)

  fun error(k: String, d: String?): Boolean = error("$k error: $d")
}
