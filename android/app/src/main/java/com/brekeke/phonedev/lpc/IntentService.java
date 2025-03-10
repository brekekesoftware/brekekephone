package com.brekeke.phonedev.lpc;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;

import com.google.gson.Gson;

import java.io.FileNotFoundException;

public class IntentService extends Service {

    private static final String TAG = "[IntentService]";
    private String CHANNEL_ID = "LPC_CHANNEL";

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        try {
            Log.d(TAG, "onStartCommand in intent service");

            String config = LocalConfig.readConfig(this);
            if (!config.isEmpty()) {
                Gson gson = new Gson();
                LpcModel.Settings settings = gson.fromJson(config, LpcModel.Settings.class);
                Context ctx = this.getApplicationContext();
                Intent i =
                        LpcUtilities.putConfigToIntent(
                                settings.host,
                                settings.port,
                                settings.token,
                                settings.userName,
                                settings.tlsKeyHash,
                                new Intent(ctx, BrekekeLpcService.class));
                ctx.startForegroundService(i);
                ctx.bindService(i, LpcUtilities.connection, BrekekeLpcService.BIND_AUTO_CREATE);
                // Used to update the status if the server turns Lpc on and off
                if (LpcUtilities.LpcCallback.cb == null) {
                    LpcUtilities.LpcCallback.setLpcCallback(v -> {
                        if (!v) {
                            ctx.unbindService(LpcUtilities.connection);
                        }
                    });
                }
            }
        } catch (FileNotFoundException e) {}

        return START_STICKY;
    }
}
