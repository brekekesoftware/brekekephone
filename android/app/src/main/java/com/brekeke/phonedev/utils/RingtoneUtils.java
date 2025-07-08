package com.brekeke.phonedev.utils;

import android.content.Context;
import android.database.Cursor;
import android.media.RingtoneManager;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.reactnativecommunity.asyncstorage.AsyncLocalStorageUtil;
import com.reactnativecommunity.asyncstorage.ReactDatabaseSupplier;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Arrays;


public class RingtoneUtils {
    public final static String[] staticRingtones = {"incallmanager_ringtone"};
    public final static String defaultRingtone = staticRingtones[0];
    private final static String TAG = "[RingtoneUtils]";

    public static String validateRingtone(String ringtone) {
        Log.d(TAG, "validateRingtone: " + ringtone);
        if (Arrays.asList(staticRingtones).contains(ringtone) || ringtone.contains("content://")) {
            return ringtone;
        }
        return defaultRingtone;
    }


    public static String getRingtoneFromUser(String username, String tenant,
                                             String host, String port, Context ctx) {
        try {
            String data = AsyncLocalStorageUtil.getItemImpl(
                    ReactDatabaseSupplier.getInstance(ctx).getReadableDatabase(), "_api_profiles");
            JSONObject jsonObject = new JSONObject(data);
            JSONArray profilesArray = jsonObject.getJSONArray("profiles");
            JSONObject account = AccountUtils.findAccountPartial(profilesArray, username, tenant, host, port);
            if (account != null) {
                if (account.getString("ringtoneName").equalsIgnoreCase("default")) {
                    return getRingtoneByName(account.getString("pbxRingtone"), ctx);
                }
                return account.getString("ringtoneData");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return defaultRingtone;
    }

    public static int getRingtoneFromRaw(String ringtoneName, Context ctx) {
        int resId = ctx.getResources().getIdentifier(ringtoneName, "raw", ctx.getPackageName());
        if (resId == 0) {
            // fallback
            resId = ctx.getResources().getIdentifier(staticRingtones[0], "raw", ctx.getPackageName());
        }
        return resId;
    }

    public static String getRingtoneByName(String ringtoneName, Context ctx) {
        if (Arrays.asList(staticRingtones).contains(ringtoneName)) {
            return ringtoneName;
        }
        Cursor cursor = null;
        try {
            RingtoneManager ringtoneManager = new RingtoneManager(ctx);
            ringtoneManager.setType(RingtoneManager.TYPE_RINGTONE);
            cursor = ringtoneManager.getCursor();
            while (cursor.moveToNext()) {
                String title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX);
                if (ringtoneName.equalsIgnoreCase(title)) {
                    return ringtoneManager.getRingtoneUri(cursor.getPosition()).toString();
                }
            }
        } catch (Exception e) {
            Log.d(TAG, "getRingtoneByName: " + e.getMessage());
        }
        finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        return defaultRingtone;
    }


    public static Boolean checkStaticRingtone(String ringtone) {
        return Arrays.asList(staticRingtones).contains(ringtone); // if true then it uses static ringtone
    }

    public static WritableMap handleRingtoneList(String title, String uri) {
        WritableMap ringtone = new WritableNativeMap();
        ringtone.putString("title", title);
        ringtone.putString("uri", uri);
        return ringtone;
    }


}
