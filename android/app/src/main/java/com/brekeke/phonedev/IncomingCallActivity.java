package com.brekeke.phonedev;

import android.app.Activity;
import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
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

  private void stopRingtone() {
    mp.stop();
    mp.release();
  }

  private Boolean closed = false;

  public void closeIncomingCallActivity() {
    if (this.closed) {
      return;
    }
    this.closed = true;
    try {
      this.finish();
    } catch (Exception e) {
    }
  }

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    this.startRingtone();

    if (IncomingCallModule.activity != null) {
      IncomingCallModule.activity.closeIncomingCallActivity();
    }
    IncomingCallModule.activity = this;

    Bundle b = getIntent().getExtras();
    if (b == null) {
      b = savedInstanceState;
    }
    if (b == null) {
      closeIncomingCallActivity();
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
    audioVideoTextView.setText(
        uuid == IncomingCallModule.PN_UUID
            ? "Incoming Call"
            : "Incoming " + (isVideoCall ? "Video" : "Audio") + " Call");

    findViewById(R.id.go_back_button)
        .setOnClickListener(
            new View.OnClickListener() {
              @Override
              public void onClick(View view) {
                closeIncomingCallActivity();
                IncomingCallModule.emit("answerCall", uuid);
              }
            });
    findViewById(R.id.trigger_alert_button)
        .setOnClickListener(
            new View.OnClickListener() {
              @Override
              public void onClick(View view) {
                closeIncomingCallActivity();
                IncomingCallModule.emit("rejectCall", uuid);
              }
            });
  }

  @Override
  protected void onDestroy() {
    this.stopRingtone();
    super.onDestroy();
  }
}
