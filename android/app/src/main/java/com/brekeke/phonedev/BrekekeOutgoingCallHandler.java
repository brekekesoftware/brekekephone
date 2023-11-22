package com.brekeke.phonedev;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class BrekekeOutgoingCallHandler extends BroadcastReceiver {
  @Override
  public void onReceive(Context ctx, Intent intent) {
    String number = getResultData();
    if (number == null) {
      number = intent.getStringExtra(Intent.EXTRA_PHONE_NUMBER);
      if (number == null) {
        number = intent.getStringExtra("com.android.phone.ROAMING_ORIGIN_NUMBER");
      }
    }
    if (number == null) {
      return;
    }
    Intent i = new Intent(ctx, MainActivity.class);
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    i.putExtra("extra_phone", number);
    ctx.startActivity(i);
  }
}
