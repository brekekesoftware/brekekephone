package com.brekeke.phonedev.lpc;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;
import androidx.annotation.Nullable;
import com.brekeke.phonedev.utils.Emitter;
import com.google.gson.Gson;
import java.io.FileNotFoundException;

// intent service to bind the main lpc service

public class BrekekeLpcServiceIntent extends Service {
  private String CHANNEL_ID = "LPC_CHANNEL";

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {

    try {
      Log.d(LpcUtils.TAG, "onStartCommand in intent service");
      Emitter.debug("[BrekekeLpcServiceIntent] onStartCommand in intent service");
      String config = LpcUtils.readConfig(this);
      if (!config.isEmpty()) {
        Gson gson = new Gson();
        LpcModel.Settings settings = gson.fromJson(config, LpcModel.Settings.class);
        Context ctx = getApplicationContext();
        Intent i =
            LpcUtils.putConfigToIntent(
                settings.host,
                settings.port,
                settings.token,
                settings.userName,
                settings.tlsKeyHash,
                settings.remoteSsids,
                new Intent(ctx, BrekekeLpcService.class));
        i.putExtra("reason", "LPC re-connect by intent service");
        ctx.startForegroundService(i);
        ctx.bindService(i, LpcUtils.connection, BrekekeLpcService.BIND_AUTO_CREATE);
        // used to update the status if the server turns Lpc on and off
        if (LpcUtils.LpcCallback.cb == null) {
          LpcUtils.LpcCallback.setLpcCallback(
              v -> {
                if (!v) {
                  ctx.unbindService(LpcUtils.connection);
                }
              });
        }
      }
    } catch (FileNotFoundException e) {
    }

    return START_STICKY;
  }
}
