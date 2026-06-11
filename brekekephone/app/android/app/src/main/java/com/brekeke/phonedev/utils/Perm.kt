package com.brekeke.phonedev.utils

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import com.brekeke.phonedev.lpc.LpcUtils
import com.facebook.react.bridge.Promise

// utils to manage permissions
// see the related part in rn js for reference

object Perm {
  const val Overlay = "Overlay"
  const val IgnoringBatteryOptimizations = "IgnoringBatteryOptimizations"
  const val AndroidLpc = "AndroidLpc"

  private interface Handler {
    fun check(): Boolean

    fun request(): Boolean
  }

  private val handlers: Map<String, Handler> =
      mapOf(
          Overlay to
              object : Handler {
                override fun check(): Boolean {
                  if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return true
                  val ctx = Ctx.app()!!
                  return Settings.canDrawOverlays(ctx)
                }

                override fun request(): Boolean {
                  val ctx = Ctx.app()!!
                  val i =
                      Intent(
                          Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                          Uri.parse("package:" + ctx.packageName),
                      )
                  i.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                  ctx.startActivity(i)
                  return true
                }
              },
          IgnoringBatteryOptimizations to
              object : Handler {
                override fun check(): Boolean {
                  if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return true
                  val ctx = Ctx.app() ?: return false
                  val pm = ctx.getSystemService(Context.POWER_SERVICE) as PowerManager
                  return pm.isIgnoringBatteryOptimizations(ctx.packageName)
                }

                override fun request(): Boolean {
                  val ctx = Ctx.app()!!
                  val i = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                  i.data = Uri.parse("package:" + ctx.packageName)
                  i.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                  ctx.startActivity(i)
                  return true
                }
              },
          AndroidLpc to
              object : Handler {
                private val OP_BACKGROUND_START_ACTIVITY_MI_UI = 10021

                override fun check(): Boolean {
                  if (!LpcUtils.isMIUI()) {
                    Emitter.debug("Permission check skipped: Non-MIUI device")
                    return true
                  }
                  return try {
                    val ctx = Ctx.app()!!
                    val mgr = ctx.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
                    val m =
                        AppOpsManager::class
                            .java
                            .getMethod(
                                "checkOpNoThrow",
                                Int::class.java,
                                Int::class.java,
                                String::class.java,
                            )
                    val r =
                        m.invoke(
                            mgr,
                            OP_BACKGROUND_START_ACTIVITY_MI_UI,
                            android.os.Process.myUid(),
                            ctx.packageName,
                        ) as Int
                    r == AppOpsManager.MODE_ALLOWED
                  } catch (e: Exception) {
                    Emitter.error("AndroidLpc Permission Exception " + e.message)
                    true
                  }
                }

                override fun request(): Boolean {
                  if (LpcUtils.isMIUI()) {
                    val ctx = Ctx.app()!!
                    val i = LpcUtils.getPermissionManagerIntent(ctx)
                    i.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_MULTIPLE_TASK
                    ctx.startActivity(i)
                    return true
                  }
                  return false
                }
              },
      )

  private val promises: MutableMap<String, MutableList<Promise>> = HashMap()

  fun check(k: String): Boolean {
    val h =
        handlers[k]
            ?: run {
              Emitter.error("Unknown permission check: $k")
              return false
            }
    return h.check()
  }

  fun request(k: String, p: Promise) {
    val h =
        handlers[k]
            ?: run {
              Emitter.error("Unknown permission request: $k")
              p.reject("PERM_ERROR", "Unknown permission: $k")
              return
            }
    if (h.request()) {
      promises.getOrPut(k) { mutableListOf() }.add(p)
    } else {
      p.resolve(true)
    }
  }

  fun resolve() {
    for ((k, list) in promises) {
      val h = handlers[k]!!
      val granted = h.check()
      for (p in list) p.resolve(granted)
    }
    promises.clear()
  }
}
