package com.brekeke.phonedev;

import android.app.Activity;
import android.app.ActivityManager;
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
  public KeyguardManager km;

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

  public Boolean closed = false, closedWithAnswerPressed = false;

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    this.startRingtone();
    km = ((KeyguardManager) getApplicationContext().getSystemService(Context.KEYGUARD_SERVICE));
    IncomingCallModule.activities.add(this);
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
    callerName = b.getString("callerName");
    isVideoCall = b.getBoolean("isVideoCall");

    vManageCall = (RelativeLayout) findViewById(R.id.view_call_manage);
    vIncomingCall = (RelativeLayout) findViewById(R.id.view_incoming_call);
    vIncomingThreeBtn = (RelativeLayout) findViewById(R.id.view_incoming_call_hold);

    getIncomingLayout().setVisibility(View.VISIBLE);

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
  }

  public RelativeLayout getIncomingLayout() {
    if (IncomingCallModule.activities.size() > 1) {
      return vIncomingThreeBtn;
    } else {
      return vIncomingCall;
    }
  }

  public void popIncomingCallActivitys() {
    int size = IncomingCallModule.activities.size();
    if (size >= 1) {
      IncomingCallModule.activities.remove(size - 1);
    }
  }

  public String getPreviousIncomingUUID() {
    IncomingCallActivity prev = IncomingCallModule.mgr.before(this.uuid).uuid;
    return prev == null ? '' : prev.uuid;
  }

  public int getNumberActivitys() {
    ActivityManager manager = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
    ActivityManager.RunningTaskInfo info = manager.getRunningTasks(1).get(0);
    return info.numActivities;
  }

  public void onBtnAnswerClick(View v) {
    IncomingCallModule.emit("answerCall", uuid);
    closeIncomingCallActivity(true);
  }

  public void onBtnRejectClick(View v) {
    forceFinish();
    IncomingCallModule.emit("rejectCall", uuid);
    popIncomingCallActivitys();
  }

  public void onBtnTransferClick(View v) {
    IncomingCallModule.emit("transfer", uuid);
    forceFinish();
  }

  public void onBtnParkClick(View v) {
    IncomingCallModule.emit("park", uuid);
    forceFinish();
  }

  public void onBtnVideoClick(View v) {
    IncomingCallModule.emit("video", uuid);
    forceFinish();
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
    forceFinish();
  }

  public void onBtnHoldClick(View v) {
    if (v.isSelected()) {
      btnHold.setSelected(false);
      txtHoldBtn.setText("HOLD");
    } else {
      btnHold.setSelected(true);
      txtHoldBtn.setText("UNHOLD");
    }
    IncomingCallModule.emit("hold", uuid);
  }

  public void onBtnEndCallClick(View v) {
    forceFinish();
    IncomingCallModule.emit("endCall", uuid);
    popIncomingCallActivitys();
  }

  public void onBtnDecilineClick(View v) {
    forceFinish();
    IncomingCallModule.emit("rejectCall", uuid);
    popIncomingCallActivitys();
  }

  public void onBtnHoldAcceptClick(View v) {
    IncomingCallModule.emit("answerCall", uuid);
    IncomingCallModule.emit("hold", this.getPreviousIncomingUUID());
    closeIncomingCallActivity(true);
  }

  public void onBtnEndAcceptClick(View v) {
    IncomingCallModule.emit("answerCall", uuid);
    IncomingCallModule.emit("endCall", this.getPreviousIncomingUUID());
    closeIncomingCallActivity(true);
  }

  public void onBtnUnlockClick(View v) {
    IncomingCallModule.activities.forEach(
        incomingCallActivity -> {
          incomingCallActivity.forceFinish();
        });
  }

  public void onRequestUnlock(View v) {
    km.requestDismissKeyguard(
        this,
        new KeyguardManager.KeyguardDismissCallback() {
          @Override
          public void onDismissError() {
            super.onDismissError();
          }

          @Override
          public void onDismissSucceeded() {
            super.onDismissSucceeded();
            onProcessAction(v);
          }

          @Override
          public void onDismissCancelled() {
            super.onDismissCancelled();
          }
        });
  }

  public void onProcessAction(View v) {
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
        onBtnDecilineClick(v);
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
        onBtnEndCallClick(v);
        break;
      default:
        break;
    }
  }

  public Boolean closeIncomingCallActivity(Boolean isAnswerPressed) {
    if (closed) {
      return true;
    }
    closedWithAnswerPressed = isAnswerPressed;
    // isKeyguardLocked() - Return whether the keyguard is currently locked.
    // isDeviceLocked() - Returns whether the device is currently locked and requires a PIN, pattern
    // or password to unlock.
    if (!isAnswerPressed || !km.isKeyguardLocked()) {
      forceFinish();
      return true;
    }
    getIncomingLayout().setVisibility(View.GONE);
    vManageCall.setVisibility(View.VISIBLE);
    forceStopRingtone();
    return false;
  }

  public void forceFinish() {
    closed = true;
    try {
      finish();
    } catch (Exception e) {
      onDestroyBackToForeground();
    }
  }

  @Override
  protected void onResume() {
    super.onResume();
  }

  @Override
  protected void onPause() {
    super.onPause();
  }

  @Override
  protected void onDestroy() {
    onDestroyBackToForeground();
    forceStopRingtone();
    super.onDestroy();
  }

  public void onDestroyBackToForeground() {
    if (closedWithAnswerPressed && IncomingCallModule.activities.size() == 1) {
      km.requestDismissKeyguard(this, new KeyguardManager.KeyguardDismissCallback() {});
      IncomingCallModule.emit("backToForeground", "");
    }
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
    } catch (Exception e) {
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
