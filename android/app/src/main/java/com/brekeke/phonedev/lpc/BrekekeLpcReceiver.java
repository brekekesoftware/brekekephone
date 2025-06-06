package com.brekeke.phonedev;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
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
        return;
      }
    } else {
      if (Intent.ACTION_SHUTDOWN.equals(intent.getAction())) {
        // end process before restart device
        System.exit(0);
      }
    }
  }
}
