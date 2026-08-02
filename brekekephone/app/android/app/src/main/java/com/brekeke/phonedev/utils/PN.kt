package com.brekeke.phonedev.utils

import android.text.TextUtils

// utils to parse push notification data
// see the related part in rn js for reference

object PN {
  fun id(m: Map<String, String>): String? = get(m, "pn-id", "pnId")

  fun autoAnswer(m: Map<String, String>): String? = get(m, "autoanswer", "autoAnswer")

  fun callerName(m: Map<String, String>): String {
    var v = get(m, "displayname", "displayName")
    if (TextUtils.isEmpty(v)) v = get(m, "from")
    if (TextUtils.isEmpty(v)) v = L.loading()
    return v!!
  }

  fun avatar(m: Map<String, String>): String? = get(m, "image")

  fun avatarSize(m: Map<String, String>): String? = get(m, "image_size", "imageSize")

  fun time(m: Map<String, String>): String? = get(m, "time")

  fun ringtone(m: Map<String, String>): String? = get(m, "ringtone")

  fun username(m: Map<String, String>): String? = get(m, "to", "pbxUsername")

  fun tenant(m: Map<String, String>): String? = get(m, "tenant", "pbxTenant")

  fun host(m: Map<String, String>): String? = get(m, "host", "pbxHostname")

  fun port(m: Map<String, String>): String? = get(m, "pbxPort", "port")

  private fun get(m: Map<String, String>, k: String): String? {
    val v = m["x_$k"]
    if (!TextUtils.isEmpty(v)) return v
    return m[k]
  }

  private fun get(m: Map<String, String>, k1: String, k2: String): String? {
    val v = get(m, k1)
    if (!TextUtils.isEmpty(v)) return v
    return get(m, k2)
  }

  @Suppress("unused")
  private fun get(m: Map<String, String>, k1: String, k2: String, k3: String): String? {
    val v = get(m, k1, k2)
    if (!TextUtils.isEmpty(v)) return v
    return get(m, k3)
  }
}
