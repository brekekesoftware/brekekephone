package com.brekeke.phonedev;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

public class MyOutgoingCallHandler extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    // Extract phone number reformatted by previous receivers
    Bundle b = intent.getExtras();
    // for (String key: b.keySet())
    // {
    //  Log.d ("thangnt::", "thangnt::"+ key + " is a key in the bundle::"+ b.get(key));
    // }
    String phoneNumber = intent.getStringExtra("com.android.phone.ROAMING_ORIGIN_NUMBER");
    // Start my app
    if (phoneNumber != null) {
      Intent i = new Intent(context, MainActivity.class);
      i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      i.putExtra("extra_phone", phoneNumber);
      context.startActivity(i);
    }
  }
}
