package com.brekeke.phonedev.utils

import android.text.TextUtils
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import com.brekeke.phonedev.R

// utils to show toasts with level colors
// only used in incoming call activity

object Toast {
  enum class Type {
    SUCCESS,
    ERROR,
    WARNING,
    INFO,
  }

  private const val duration = 5000L

  fun show(container: LinearLayout, m: String, d: String?, t: Type) {
    val h = Ctx.h()
    h.post {
      try {
        val ctx = Ctx.app()!!
        val v = LayoutInflater.from(ctx).inflate(R.layout.toast, null, true)
        v.setBackgroundColor(color(t))
        val mv = v.findViewById<TextView>(R.id.toast_message)
        mv.text = m
        val dv = v.findViewById<TextView>(R.id.toast_detail)
        if (!TextUtils.isEmpty(d)) {
          dv.text = d
          dv.visibility = View.VISIBLE
        } else {
          dv.visibility = View.GONE
        }
        container.addView(v, 0)
        h.postDelayed(
            {
              try {
                container.removeView(v)
              } catch (_: Exception) {}
            },
            duration,
        )
      } catch (_: Exception) {}
    }
  }

  private fun color(t: Type): Int {
    val ctx = Ctx.app()!!
    val r = ctx.resources
    return when (t) {
      Type.SUCCESS -> r.getColor(R.color.toast_success)
      Type.ERROR -> r.getColor(R.color.toast_error)
      Type.WARNING -> r.getColor(R.color.toast_warning)
      else -> r.getColor(R.color.toast_info)
    }
  }

  fun show(container: LinearLayout, m: String, d: String?, t: String) {
    show(container, m, d, type(t))
  }

  private fun type(t: String): Type =
      when (t.lowercase()) {
        "success" -> Type.SUCCESS
        "error" -> Type.ERROR
        "warning" -> Type.WARNING
        "info" -> Type.INFO
        else -> Type.INFO
      }
}
