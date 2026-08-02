package com.brekeke.phonedev.utils

import android.content.Context
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.ReactApplicationContext

// utils to manage contexts
// main react native context and push notification context are different
// on push notification wake up, the react native js might not be available yet

object Ctx {
  private var rn: ReactApplicationContext? = null
  private var main: Context? = null
  private var pn: Context? = null

  private fun setRn(ctx: ReactApplicationContext?) {
    if (ctx != null && rn == null) rn = ctx
  }

  private fun setRn(ctx: Context?) {
    if (ctx is ReactApplicationContext) {
      setRn(ctx)
      return
    }
    val a = ctx?.applicationContext
    if (a is ReactApplicationContext) {
      setRn(a)
    }
  }

  fun wakeFromMainRn(ctx: Context) {
    main = ctx
    setRn(ctx)
    init()
  }

  fun wakeFromPn(ctx: Context) {
    pn = ctx
    setRn(ctx)
    init()
  }

  fun app(): Context? {
    val a1 = rn?.applicationContext
    if (a1 != null) return a1
    val a2 = main?.applicationContext
    if (a2 != null) return a2
    val a3 = pn?.applicationContext
    if (a3 != null) return a3
    if (rn != null) return rn
    if (main != null) return main
    return pn
  }

  fun rn(): ReactApplicationContext? {
    if (rn != null) return rn
    val a = app()
    if (a is ReactApplicationContext) return a
    return null
  }

  private fun init() {
    L.init()
    Emitter.init()
    Ringtone.init()
  }

  fun h(): Handler = Handler(Looper.getMainLooper())
}
