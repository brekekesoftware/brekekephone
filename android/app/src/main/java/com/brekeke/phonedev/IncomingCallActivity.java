package com.brekeke.phonedev;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.RelativeLayout;
import android.widget.TextView;
import androidx.annotation.Nullable;

public class IncomingCallActivity extends Activity implements View.OnClickListener {
  public MediaPlayer mp;

  public RelativeLayout vManageCall, vIncomingCall, vIncomingThreeBtn;
  public Button btnAnswer,
      btnReject,
      btnTransfer,
      btnPark,
      btnVideo,
      btnSpeaker,
      btnMute,
      btnRecord,
      btnDtmf,
      btnHold,
      btnEndcall,
      btnDecilinne,
      btnEndAccept,
      btnUnlock,
      btnHoldAccept;
  public TextView txtCallerName, txtCallStatus, txtHoldBtn, txtMuteBtn;
  public String uuid, callerName;
  public Boolean isVideoCall;

  public Boolean closed = false, paused = false, answered = false;

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    IncomingCallModule.mgr.push(this);
    startRingtone();
    Bundle b = getIntent().getExtras();
    if (b == null) {
      b = savedInstanceState;
    }
    if (b == null) {
      IncomingCallModule.mgr.remove(uuid);
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
    callerName = b.getString("callerName");
    isVideoCall = b.getBoolean("isVideoCall");
    vManageCall = (RelativeLayout) findViewById(R.id.view_call_manage);
    vIncomingCall = (RelativeLayout) findViewById(R.id.view_incoming_call);
    vIncomingThreeBtn = (RelativeLayout) findViewById(R.id.view_incoming_call_hold);

    vIncomingCall.setVisibility(View.VISIBLE);

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
    btnEndcall = (Button) findViewById(R.id.btn_end_call);
    btnDecilinne = (Button) findViewById(R.id.btn_deciline);
    btnEndAccept = (Button) findViewById(R.id.btn_end_accept);
    btnHoldAccept = (Button) findViewById(R.id.btn_hold_accept);
    btnUnlock = (Button) findViewById(R.id.btn_unlock);

    btnAnswer.setOnClickListener(this);
    btnReject.setOnClickListener(this);
    btnTransfer.setOnClickListener(this);
    btnPark.setOnClickListener(this);
    btnVideo.setOnClickListener(this);
    btnSpeaker.setOnClickListener(this);
    btnMute.setOnClickListener(this);
    btnRecord.setOnClickListener(this);
    btnDtmf.setOnClickListener(this);
    btnHold.setOnClickListener(this);
    btnEndcall.setOnClickListener(this);
    btnDecilinne.setOnClickListener(this);
    btnEndAccept.setOnClickListener(this);
    btnHoldAccept.setOnClickListener(this);
    btnUnlock.setOnClickListener(this);

    txtCallerName = (TextView) findViewById(R.id.txt_caller_name);
    txtCallStatus = (TextView) findViewById(R.id.txt_call_status);
    txtHoldBtn = (TextView) findViewById(R.id.txt_hold);
    txtMuteBtn = (TextView) findViewById(R.id.txt_mute);

    txtCallerName.setText(callerName);
    txtCallStatus.setText("Incoming " + (isVideoCall ? "Video" : "Audio") + " Call");

    btnVideo.setSelected(isVideoCall);
  }

  public void onBtnAnswerClick(View v) {
    IncomingCallModule.emit("answerCall", uuid);
    if (IncomingCallModule.isLocked()) {
      onAnswerCheckLocked();
    } else {
      IncomingCallModule.mgr.removeAllAndBackToForeground();
    }
  }

  public void onBtnRejectClick(View v) {
    IncomingCallModule.emit("rejectCall", uuid);
    answered = false;
    IncomingCallModule.mgr.remove(uuid);
  }

  public void onBtnTransferClick(View v) {
    IncomingCallModule.emit("transfer", uuid);
  }

  public void onBtnParkClick(View v) {
    IncomingCallModule.emit("park", uuid);
  }

  public void onBtnVideoClick(View v) {
    IncomingCallModule.emit("video", uuid);
  }

  public void onBtnSpeakerClick(View v) {
    if (v.isSelected()) {
      btnSpeaker.setSelected(false);
    } else {
      btnSpeaker.setSelected(true);
    }
    IncomingCallModule.emit("speaker", uuid);
  }

  public void onBtnMuteClick(View v) {
    if (v.isSelected()) {
      btnMute.setSelected(false);
      txtMuteBtn.setText("MUTE");
    } else {
      btnMute.setSelected(true);
      txtMuteBtn.setText("UNMUTE");
    }
    IncomingCallModule.emit("mute", uuid);
  }

  public void onBtnRecordClick(View v) {
    if (v.isSelected()) {
      btnRecord.setSelected(false);
    } else {
      btnRecord.setSelected(true);
    }
    IncomingCallModule.emit("record", uuid);
  }

  public void onBtnDtmfClick(View v) {
    IncomingCallModule.emit("dtmf", uuid);
  }

  public void updateBtnHoldUI(Boolean holding) {
    runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            btnHold.setSelected(holding);
            txtHoldBtn.setText(holding ? "UNHOLD" : "HOLD");
          }
        });
  }

  public void onBtnHoldClick(View v) {
    IncomingCallModule.emit("hold", uuid);
  }

  public void onBtnHoldAcceptClick(View v) {
    // Should auto hold the previous one in js after answer
    IncomingCallModule.emit("answerCall", uuid);
    onAnswerCheckLocked();
  }

  public void onBtnEndAcceptClick(View v) {
    IncomingCallModule.emit("answerCall", uuid);
    IncomingCallModule.emit("endCall", IncomingCallModule.mgr.uuidBefore(uuid));
    onAnswerCheckLocked();
  }

  public void onBtnUnlockClick(View v) {
    // Already invoked in onKeyguardDismissSucceeded
  }

  public void onRequestUnlock(View v) {
    IncomingCallModule.km.requestDismissKeyguard(
        this,
        new KeyguardManager.KeyguardDismissCallback() {
          @Override
          public void onDismissSucceeded() {
            super.onDismissSucceeded();
            onKeyguardDismissSucceeded(v);
          }
        });
  }

  public void onKeyguardDismissSucceeded(View v) {
    switch (v.getId()) {
      case R.id.btn_unlock:
        onBtnUnlockClick(v);
        break;
      case R.id.btn_transfer:
        onBtnTransferClick(v);
        break;
      case R.id.btn_park:
        onBtnParkClick(v);
        break;
      case R.id.btn_video:
        onBtnVideoClick(v);
        break;
      case R.id.btn_dtmf:
        onBtnDtmfClick(v);
        break;
      default:
        break;
    }
    IncomingCallModule.mgr.removeAllAndBackToForeground();
  }

  @Override
  public void onClick(View v) {
    switch (v.getId()) {
      case R.id.btn_unlock:
        onRequestUnlock(v);
        break;
      case R.id.btn_hold_accept:
        onBtnHoldAcceptClick(v);
        break;
      case R.id.btn_end_accept:
        onBtnEndAcceptClick(v);
        break;
      case R.id.btn_deciline:
        onBtnRejectClick(v);
        break;
      case R.id.btn_answer:
        onBtnAnswerClick(v);
        break;
      case R.id.btn_reject:
        onBtnRejectClick(v);
        break;
      case R.id.btn_transfer:
        onRequestUnlock(v);
        break;
      case R.id.btn_park:
        onRequestUnlock(v);
        break;
      case R.id.btn_video:
        onRequestUnlock(v);
        break;
      case R.id.btn_speaker:
        onBtnSpeakerClick(v);
        break;
      case R.id.btn_mute:
        onBtnMuteClick(v);
        break;
      case R.id.btn_record:
        onBtnRecordClick(v);
        break;
      case R.id.btn_dtmf:
        onRequestUnlock(v);
        break;
      case R.id.btn_hold:
        onBtnHoldClick(v);
        break;
      case R.id.btn_end_call:
        onBtnRejectClick(v);
        break;
      default:
        break;
    }
  }

  public void onAnswerCheckLocked() {
    answered = true;
    if (!IncomingCallModule.isLocked()) {
      IncomingCallModule.mgr.remove(uuid);
      return;
    }
    vIncomingCall.setVisibility(View.GONE);
    vManageCall.setVisibility(View.VISIBLE);
    forceStopRingtone();
  }

  public void forceFinish() {
    closed = true;
    try {
      finish();
    } catch (Exception e) {
    }
  }

  @Override
  protected void onPause() {
    forceStopRingtone();
    paused = true;
    IncomingCallModule.mgr.onActivityStop();
    super.onPause();
  }

  @Override
  protected void onResume() {
    if (!answered && mp == null) {
      startRingtone();
    }
    paused = false;
    super.onResume();
  }

  @Override
  protected void onDestroy() {
    forceStopRingtone();
    closed = true;
    IncomingCallModule.mgr.onActivityStop();
    super.onDestroy();
  }

  public void startRingtone() {
    Context ctx = getApplicationContext();
    AudioManager am = ((AudioManager) ctx.getSystemService(Context.AUDIO_SERVICE));
    int mode = am.getRingerMode();
    if (mode == AudioManager.RINGER_MODE_SILENT) {
      return;
    }
    Vibrator vib = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
    long[] pattern = {0, 1000, 1000};
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      vib.vibrate(VibrationEffect.createWaveform(pattern, new int[] {0, 255, 0}, 0));
    } else {
      vib.vibrate(pattern, 0);
    }
    am.setMode(AudioManager.MODE_RINGTONE);
    mp =
        MediaPlayer.create(
            ctx,
            R.raw.incallmanager_ringtone,
            new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_UNKNOWN)
                .setLegacyStreamType(AudioManager.STREAM_RING)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                .build(),
            am.generateAudioSessionId());
    mp.setVolume(1.0f, 1.0f);
    mp.setLooping(true);
    mp.start();
  }

  public void forceStopRingtone() {
    try {
      Context ctx = getApplicationContext();
      Vibrator vib = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
      vib.cancel();
    } catch (Exception e) {
    }
    try {
      mp.stop();
      mp.release();
      mp = null;
    } catch (Exception e) {
      mp = null;
    }
  }

  @Override
  public boolean onKeyDown(int k, KeyEvent e) {
    forceStopRingtone();
    return super.onKeyDown(k, e);
  }

  @Override
  public boolean dispatchKeyEvent(KeyEvent e) {
    return onKeyDown(e.getAction(), e);
  }
}
