package com.brekeke.phonedev;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

public class MyOutgoingCallHandler extends BroadcastReceiver {
 @Override
 public void onReceive(Context context, Intent intent) {
  // Extract phone number reformatted by previous receivers
  Bundle b = intent.getExtras();
  for (String key: b.keySet())
  {
   Log.d ("thangnt::", "thangnt::"+key + " is a key in the bundle::"+b.getString(key));
  }
  String phoneNumber = intent.getStringExtra("com.android.phone.ROAMING_ORIGIN_NUMBER");
  Log.d("thangnt::", "thangnt::onReceive::"+ phoneNumber);
//  if (phoneNumber == null) {
//   // No reformatted number, use the original
//   phoneNumber = intent.getStringExtra("com.android.phone.ROAMING_ORIGIN_NUMBER");
//  }

  Toast.makeText(context, "thangnt::onReceive::phoneNumber::"+ phoneNumber, Toast.LENGTH_SHORT).show();
  setResultData(null);
// Start my app
  Intent i=new Intent(context,MainActivity.class);
  i.putExtra("extra_phone", phoneNumber);
  i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
  context.startActivity(i);
//  if(phoneNumber.equals("1234")){ // DialedNumber checking.
//   // My app will bring up, so cancel the broadcast
//   setResultData(null);
//
//   // Start my app
//   Intent i=new Intent(context,MainActivity.class);
//   i.putExtra("extra_phone", phoneNumber);
//   i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
//   context.startActivity(i);
//  }

 }
}
