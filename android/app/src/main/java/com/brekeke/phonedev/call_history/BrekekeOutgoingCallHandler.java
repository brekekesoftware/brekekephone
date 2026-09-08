package com.brekeke.phonedev.call_history;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import com.brekeke.phonedev.MainActivity;

public class BrekekeOutgoingCallHandler extends BroadcastReceiver {
  @Override
  public void onReceive(Context ctx, Intent intent) {
    Bundle b = intent.getExtras();
    String number = intent.getStringExtra("com.android.phone.ROAMING_ORIGIN_NUMBER");
    if (number == null) {
      return;
    }
    Intent i = new Intent(ctx, MainActivity.class);
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    i.putExtra("extra_phone", number);
    ctx.startActivity(i);
  }
}
