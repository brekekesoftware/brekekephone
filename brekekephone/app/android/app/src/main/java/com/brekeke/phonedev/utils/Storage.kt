package com.brekeke.phonedev.utils

import com.reactnativecommunity.asyncstorage.AsyncLocalStorageUtil
import com.reactnativecommunity.asyncstorage.ReactDatabaseSupplier
import org.json.JSONArray
import org.json.JSONObject

// utils to quickly access async local storage
// see the related part in rn js for reference

object Storage {
  private const val kAccountsAndData = "_api_profiles"
  private const val kAccounts = "profiles"
  private const val kPicker = "ringtonePicker"
  private const val kLocale = "locale"

  private fun read(k: String): String? {
    val ctx = Ctx.app()
    val d = ReactDatabaseSupplier.getInstance(ctx).readableDatabase
    return AsyncLocalStorageUtil.getItemImpl(d, k)
  }

  private fun accountsAndData(): JSONObject = JSONObject(read(kAccountsAndData)!!)

  fun accounts(): JSONArray = accountsAndData().optJSONArray(kAccounts)!!

  fun picker(): JSONObject = accountsAndData().optJSONObject(kPicker)!!

  fun locale(): String? = read(kLocale)
}
