package com.brekeke.phonedev.lpc;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import com.brekeke.phonedev.utils.Emitter;
import com.facebook.react.ReactApplication;

// lpc boot receiver

public class BrekekeLpcReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context ctx, Intent intent) {
    if (!BrekekeLpcService.isServiceStarted) {
      if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
        // start lpc service
        Intent i = new Intent(ctx, BrekekeLpcServiceIntent.class);
        LpcUtils.createReactContextInBackground((ReactApplication) ctx.getApplicationContext());
        ctx.startService(i);
        Log.d(LpcUtils.TAG, "Boot completed");
        Emitter.debug(
            "[BrekekeLpcReceiver] Boot completed and start lpc service in service intent");
      }
    } else {
      if (Intent.ACTION_SHUTDOWN.equals(intent.getAction())) {
        // end process before restart device
        System.exit(0);
      }
    }
  }
}
