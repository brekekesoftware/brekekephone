package com.brekeke.phonedev;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BrekekeBroadcastReceiver extends BroadcastReceiver {

  private static final String TAG = "[BrekekeBroadcastReceiver]";

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(TAG, "Restart service Lpc called");
    Log.d(TAG, "Action " + intent.getAction());
    if (!BrekekeLpcService.isServiceStarted) {
      if (intent.getAction() == Intent.ACTION_BOOT_COMPLETED) {
        Intent intentLpc = new Intent(context, BrekekeLpcService.class);
        Log.d(TAG, "Starting the service in >=26 Mode from a BroadcastReceiver");
        context.startForegroundService(intentLpc);
        return;
      }
    }
  }

  private void restartLpcService(Context context, String content) {
    Log.d(TAG, "Restart lpc service");
  }
}
