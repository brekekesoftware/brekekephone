package com.brekeke.phonedev;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;

public class IncomingCallActivity extends Activity implements View.OnClickListener {
  private MediaPlayer mp;
  private String uuid;
  private RelativeLayout vManageCall, vIncomingCall;
  private Button btnAnswer, btnReject;
  private Button btnTransfer,
      btnPark,
      btnVideo,
      btnSpeaker,
      btnMute,
      btnRecord,
      btnDtmf,
      btnHold,
      btnEndcall;
  private TextView txtHold, txtMute;

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

  private Boolean closed = false;
  private Boolean closedWithAnswerPressed = false;

  private void forceFinish() {
    closed = true;
    try {
      finish();
    } catch (Exception e) {
      checkAndEmitShowCall();
    }
  }

  private void checkAndEmitShowCall() {
    if (closedWithAnswerPressed) {
      ((KeyguardManager) getApplicationContext().getSystemService(Context.KEYGUARD_SERVICE))
          .requestDismissKeyguard(this, new KeyguardManager.KeyguardDismissCallback() {});
      IncomingCallModule.emit("showCall", "");
    }
  }

  public Boolean closeIncomingCallActivity(Boolean isAnswerPressed) {
    if (closed) {
      return true;
    }
    closedWithAnswerPressed = isAnswerPressed;

    // TODO test behavior of this case
    //    Boolean requestUnlockOnAnswer = false;
    //    if (requestUnlockOnAnswer) {
    //      forceFinish();
    //      return true;
    //    }

    if (!isAnswerPressed
        || !((KeyguardManager) getApplicationContext().getSystemService(Context.KEYGUARD_SERVICE))
            .isDeviceLocked()) {
      forceFinish();
      return true;
    }
    vIncomingCall.setVisibility(View.GONE);
    vManageCall.setVisibility(View.VISIBLE);
    forceStopRingtone();
    return false;
  }

  public void initViewManager(Bundle b) {
    String callerName = b.getString("callerName");
    TextView txtCallerName = (TextView) findViewById(R.id.txt_caller_name);
    txtCallerName.setText(callerName);
    Boolean isVideoCall = b.getBoolean("isVideoCall");
    TextView txtCallStatus = (TextView) findViewById(R.id.txt_call_status);
    txtCallStatus.setText("Incoming " + (isVideoCall ? "Video" : "Audio") + " Call");

    vManageCall = (RelativeLayout) findViewById(R.id.view_call_manage);
    vIncomingCall = (RelativeLayout) findViewById(R.id.view_incoming_call);
    btnEndcall = (Button) findViewById(R.id.btn_end_call);
    btnAnswer = (Button) findViewById(R.id.btn_answer);
    btnReject = (Button) findViewById(R.id.btn_reject);
    btnTransfer = (Button) findViewById(R.id.btn_transfer);
    btnPark = (Button) findViewById(R.id.btn_park);
    btnVideo = (Button) findViewById(R.id.btn_video);
    btnSpeaker = (Button) findViewById(R.id.btn_speaker);
    btnMute = (Button) findViewById(R.id.btn_mute);
    btnRecord = (Button) findViewById(R.id.btn_record);
    btnDtmf = (Button) findViewById(R.id.btn_dtmf);
    btnHold = (Button) findViewById(R.id.btn_hold);
    txtHold = (TextView) findViewById(R.id.txt_hold);
    txtMute = (TextView) findViewById(R.id.txt_mute);
  }

  public void processingIncomingCall(String uuid) {
    btnAnswer.setOnClickListener(this);
    btnReject.setOnClickListener(this);
  }

  public void processingManageCall(String uuid) {
    btnSpeaker.setOnClickListener(this);
    btnEndcall.setOnClickListener(this);
    btnTransfer.setOnClickListener(this);
    btnPark.setOnClickListener(this);
    btnVideo.setOnClickListener(this);
    btnMute.setOnClickListener(this);
    btnRecord.setOnClickListener(this);
    btnDtmf.setOnClickListener(this);
    btnHold.setOnClickListener(this);
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

    uuid = b.getString("uuid");
    initViewManager(b);
    processingIncomingCall(uuid);
    processingManageCall(uuid);
  }

  @Override
  protected void onPause() {
    // On home button press
    // TODO it is now taking ~5s until main rn app open, we'll try improve this later
    if (closedWithAnswerPressed) {
      forceFinish();
    }
    super.onPause();
  }

  @Override
  protected void onDestroy() {
    checkAndEmitShowCall();
    forceStopRingtone();
    super.onDestroy();
  }

  public void onClickHold(View v) {
    if (v.isSelected()) {
      btnHold.setSelected(false);
      txtHold.setText(R.string.hold);
    } else {
      btnHold.setSelected(true);
      txtHold.setText(R.string.unhold);
    }
    IncomingCallModule.emit("hold", uuid);
  }

  public void onClickDTMF(View v) {
    IncomingCallModule.emit("dtmf", uuid);
    forceFinish();
  }

  public void onClickRecord(View v) {
    if (v.isSelected()) {
      btnRecord.setSelected(false);
    } else {
      btnRecord.setSelected(true);
    }
    IncomingCallModule.emit("record", uuid);
  }

  public void onClickMute(View v) {
    if (v.isSelected()) {
      btnMute.setSelected(false);
      txtMute.setText(R.string.mute);
    } else {
      btnMute.setSelected(true);
      txtMute.setText(R.string.unute);
    }
    IncomingCallModule.emit("mute", uuid);
  }

  public void onClickSpeaker(View v) {
    if (v.isSelected()) {
      btnSpeaker.setSelected(false);
    } else {
      btnSpeaker.setSelected(true);
    }
    IncomingCallModule.emit("speaker", uuid);
  }

  public void onClickVideo(View v) {
    //        if (v.isSelected()) {
    //            btn_video.setSelected(false);
    //        } else {
    //            btn_video.setSelected(true);
    //        }
    IncomingCallModule.emit("video", uuid);
    forceFinish();
  }

  public void onClickPark(View v) {
    IncomingCallModule.emit("park", uuid);
    forceFinish();
  }

  public void onClickTransfer(View v) {
    IncomingCallModule.emit("transfer", uuid);
    forceFinish();
  }

  public void onClickEndCall(View v) {
    IncomingCallModule.emit("endCall", uuid);
  }

  public void onClickAnswer(View v) {
    closeIncomingCallActivity(true);
    IncomingCallModule.emit("answerCall", uuid);
  }

  public void onClickReject(View v) {
    closeIncomingCallActivity(false);
    IncomingCallModule.emit("rejectCall", uuid);
  }

  @Override
  public void onClick(View v) {
    switch (v.getId()) {
      case R.id.btn_hold:
        onClickHold(v);
        break;
      case R.id.btn_dtmf:
        onClickDTMF(v);
        break;
      case R.id.btn_record:
        onClickRecord(v);
        break;
      case R.id.btn_mute:
        onClickMute(v);
        break;
      case R.id.btn_speaker:
        onClickSpeaker(v);
        break;
      case R.id.btn_video:
        onClickVideo(v);
        break;
      case R.id.btn_park:
        onClickPark(v);
        break;
      case R.id.btn_transfer:
        onClickTransfer(v);
        break;
      case R.id.btn_end_call:
        onClickEndCall(v);
        break;
      case R.id.btn_answer:
        onClickAnswer(v);
        break;
      case R.id.btn_reject:
        onClickReject(v);
        break;
      default:
        break;
    }
  }
}
