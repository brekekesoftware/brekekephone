package com.brekeke.phone.utils;

import com.reactnativecommunity.asyncstorage.AsyncLocalStorageUtil;
import com.reactnativecommunity.asyncstorage.ReactDatabaseSupplier;
import org.json.JSONArray;
import org.json.JSONObject;

// utils to quickly access async local storage
// see the related part in rn js for reference

public class Storage {
  // ==========================================================================
  // accounts

  private static String kAccountsAndData = "_api_profiles";
  private static String kAccounts = "profiles";
  private static String kData = "profileData";

  private static String read(String k) throws Exception {
    var ctx = Ctx.app();
    var d = ReactDatabaseSupplier.getInstance(ctx).getReadableDatabase();
    return AsyncLocalStorageUtil.getItemImpl(d, k);
  }

  private static JSONObject accountsAndData() throws Exception {
    var j = read(kAccountsAndData);
    return new JSONObject(j);
  }

  public static JSONArray accounts() throws Exception {
    return accountsAndData().optJSONArray(kAccounts);
  }

  public static JSONArray data() throws Exception {
    return accountsAndData().optJSONArray(kData);
  }

  // ==========================================================================
  // locale

  private static String kLocale = "locale";

  public static String locale() throws Exception {
    return read(kLocale);
  }
}
