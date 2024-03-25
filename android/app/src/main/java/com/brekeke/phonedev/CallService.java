package com.brekeke.phonedev;

import android.content.Intent;
import android.net.Uri;
import android.telecom.Call;
import android.telecom.InCallService;
import android.telecom.TelecomManager;

public class CallService extends InCallService {

  @Override
  public void onCallAdded(Call call) {
    super.onCallAdded(call);
    call.registerCallback(callCallback);
    // We can start our call Activity here
    try {
      if (call.getDetails().getHandlePresentation() == TelecomManager.PRESENTATION_ALLOWED) {
        // This is an outgoing call
        String number = call.getDetails().getHandle().getSchemeSpecificPart();
        if (number == null) {
          return;
        }
        Uri phoneNumberUri = Uri.parse("tel:" + number);
        Intent intent = new Intent(Intent.ACTION_VIEW, phoneNumberUri);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.addCategory(Intent.CATEGORY_BROWSABLE);
        startActivity(intent);
      } else {
        // Todo with incoming call
      }
    } catch (Exception e) {

    }
  }

  @Override
  public void onCallRemoved(Call call) {
    super.onCallRemoved(call);
    call.unregisterCallback(callCallback);
  }

  private Call.Callback callCallback =
      new Call.Callback() {
        @Override
        public void onStateChanged(Call call, int state) {}
      };
}
