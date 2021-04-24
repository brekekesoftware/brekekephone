package com.brekeke.phonedev;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.Nullable;

public class IncomingCallActivity extends Activity {
  private MediaPlayer mp;

  private void startRingtone() {
    Context ctx = getApplicationContext();
    AudioManager am = ((AudioManager) ctx.getSystemService(Context.AUDIO_SERVICE));
    am.setMode(AudioManager.MODE_RINGTONE);

    AudioAttributes attr =
        new AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_UNKNOWN)
            .setLegacyStreamType(AudioManager.STREAM_RING)
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
            .build();
    int id = am.generateAudioSessionId();

    mp = MediaPlayer.create(ctx, R.raw.incallmanager_ringtone, attr, id);
    mp.setVolume(1.0f, 1.0f);
    mp.setLooping(true);
    mp.start();
  }

  private void forceStopRingtone() {
    try {
      mp.stop();
      mp.release();
    } catch (Exception e) {
    }
  }

  private void forceFinish() {
    closed = true;
    try {
      finish();
    } catch (Exception e) {
    }
  }

  private Boolean closed = false;
  private Boolean closedWithCheckDeviceLocked = false;

  public void closeIncomingCallActivity(Boolean checkDeviceLocked) {
    if (closed) {
      return;
    }
    if (checkDeviceLocked) {
      Context ctx = getApplicationContext();
      KeyguardManager km = (KeyguardManager) ctx.getSystemService(Context.KEYGUARD_SERVICE);
      if (km.isDeviceLocked()) {
        TextView audioVideoTextView = (TextView) findViewById(R.id.audio_video_text);
        audioVideoTextView.setText("Call is in progress\nUnlock your phone to continue");
        Button goBackBtn = (Button) findViewById(R.id.go_back_button);
        if (goBackBtn != null) {
          ViewGroup goBackBtnLayout = (ViewGroup) goBackBtn.getParent();
          goBackBtnLayout.removeView(goBackBtn);
        }
        Button triggerAlertBtn = (Button) findViewById(R.id.trigger_alert_button);
        if (triggerAlertBtn != null) {
          ViewGroup triggerAlertBtnLayout = (ViewGroup) triggerAlertBtn.getParent();
          triggerAlertBtnLayout.removeView(triggerAlertBtn);
        }
        closedWithCheckDeviceLocked = true;
        forceStopRingtone();
        return;
      }
    }
    forceFinish();
  }

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    startRingtone();

    if (IncomingCallModule.activity != null) {
      IncomingCallModule.activity.closeIncomingCallActivity(false);
    }
    IncomingCallModule.activity = this;

    Bundle b = getIntent().getExtras();
    if (b == null) {
      b = savedInstanceState;
    }
    if (b == null) {
      closeIncomingCallActivity(false);
      return;
    }

    setContentView(R.layout.incoming_call_activity);
    getWindow()
        .addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);

    String uuid = b.getString("uuid");
    String callerName = b.getString("callerName");
    TextView callerNameTextView = (TextView) findViewById(R.id.caller_name_text);
    callerNameTextView.setText(callerName);
    Boolean isVideoCall = b.getBoolean("isVideoCall");
    TextView audioVideoTextView = (TextView) findViewById(R.id.audio_video_text);
    audioVideoTextView.setText("Incoming " + (isVideoCall ? "Video" : "Audio") + " Call");

    findViewById(R.id.go_back_button)
        .setOnClickListener(
            new View.OnClickListener() {
              @Override
              public void onClick(View view) {
                closeIncomingCallActivity(true);
                IncomingCallModule.emit("answerCall", uuid);
              }
            });
    findViewById(R.id.trigger_alert_button)
        .setOnClickListener(
            new View.OnClickListener() {
              @Override
              public void onClick(View view) {
                closeIncomingCallActivity(false);
                IncomingCallModule.emit("rejectCall", uuid);
              }
            });
  }

  @Override
  protected void onPause() {
    // On home button press
    // TODO it is now taking ~5s until main rn app open, we'll try improve this later
    if (closedWithCheckDeviceLocked) {
      forceFinish();
    }
    super.onPause();
  }

  @Override
  protected void onDestroy() {
    if (closedWithCheckDeviceLocked) {
      IncomingCallModule.emit("showCall", "");
    } else {
      forceStopRingtone();
    }
    super.onDestroy();
  }
}
