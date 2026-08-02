package com.brekeke.phonedev.utils

import android.text.TextUtils
import org.json.JSONObject

// utils to handle account from local storage
// see the related part in rn js for reference

object Account {
  fun find(u: String?, t: String?, h: String?, p: String?): JSONObject? {
    return try {
      val arr = Storage.accounts()
      for (i in 0 until arr.length()) {
        val a = arr.optJSONObject(i) ?: continue
        val u2 = a.optString("pbxUsername")
        if (TextUtils.isEmpty(u2)) continue
        val t2 = a.optString("pbxTenant")
        val h2 = a.optString("pbxHostname")
        val p2 = a.optString("pbxPort")
        if (u2 == u && equals(t2, t) && equals(h2, h) && equals(p2, p)) return a
      }
      null
    } catch (_: Exception) {
      null
    }
  }

  fun find(m: Map<String, String>): JSONObject? {
    val u = PN.username(m)
    val t = PN.tenant(m)
    val h = PN.host(m)
    val p = PN.port(m)
    return find(u, t, h, p)
  }

  private fun equals(v1: String?, v2: String?): Boolean =
      TextUtils.isEmpty(v1) || TextUtils.isEmpty(v2) || v1 == v2
}
