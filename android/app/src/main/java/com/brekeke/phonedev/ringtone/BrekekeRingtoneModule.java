package com.brekeke.phonedev.ringtone;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import java.lang.reflect.Field;

public class BrekekeRingtoneModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public BrekekeRingtoneModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @ReactMethod
    public void getRingtoneList(Promise promise) {
        try {
            WritableArray ringtoneList = Arguments.createArray();

            Class<?> rawClass = Class.forName(reactContext.getPackageName() + ".R$raw");
            Field[] fields = rawClass.getFields();

            for (Field field : fields) {
                String name = field.getName().toLowerCase();
                if (!name.equalsIgnoreCase("ca")) {
                    ringtoneList.pushString(name);
                }
            }
            promise.resolve(ringtoneList);
        } catch (ClassNotFoundException e) {
            promise.reject("CLASS_NOT_FOUND", "Cannot find R.raw class");
        } catch (Exception e) {
            promise.reject("ERROR", "Unexpected error: " + e.getMessage());
        }
    }

    @ReactMethod
    public void setRingtoneForAccount(String accountId, String ringtoneName) {
        SharedPreferences prefs = getReactApplicationContext()
                .getSharedPreferences("AccountPrefs", Context.MODE_PRIVATE);
        prefs.edit().putString(accountId, ringtoneName).apply();
    }

    @ReactMethod
    public void removeRingtoneForAccount(String accountId) {
        SharedPreferences prefs = getReactApplicationContext()
                .getSharedPreferences("AccountPrefs", Context.MODE_PRIVATE);
        prefs.edit().remove(accountId).apply();
    }

    @NonNull
    @Override
    public String getName() {
        return "RingtoneModule";
    }
}
