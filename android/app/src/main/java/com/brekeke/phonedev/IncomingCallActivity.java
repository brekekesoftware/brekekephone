package com.brekeke.phonedev;

import static com.brekeke.phonedev.IncomingCallModule.mgr;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.RelativeLayout;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.Lifecycle.State;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.OnLifecycleEvent;
import androidx.lifecycle.ProcessLifecycleOwner;

public class IncomingCallActivity extends Activity
    implements View.OnClickListener, LifecycleObserver {
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

  public Boolean closed = false, closedWithAnswerPressed = false, isActivityStarted = false;

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    Log.d("DEV", "onCreate: " + uuid);
    super.onCreate(savedInstanceState);
    ProcessLifecycleOwner.get().getLifecycle().addObserver(this);
    this.startRingtone();
    km = ((KeyguardManager) getApplicationContext().getSystemService(Context.KEYGUARD_SERVICE));
    mgr.push(this);
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
    Log.d("DEV", "UUID::" + uuid + "::isVideo::" + isVideoCall);
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

    updateUIBtnVideo(isVideoCall);
  }

  public void updateUIBtnVideo(Boolean isVideoCall) {
    btnVideo.setSelected(isVideoCall);
  }

  public RelativeLayout getIncomingLayout() {
    // if (IncomingCallModule.activities.size() > 1) {
    //   return vIncomingThreeBtn;
    // } else {
    //   return vIncomingCall;
    // }
    return vIncomingCall;
  }

  public void onBtnAnswerClick(View v) {
    IncomingCallModule.emit("answerCall", uuid);
    State a = ProcessLifecycleOwner.get().getLifecycle().getCurrentState();
     Log.d("DEV:", "onBtnAnswerClick: "+ a.name());
    // case app state don't lock should be open app
    if(km.isKeyguardLocked()){
      IncomingCallActivity itemBefore = mgr.before(uuid);
      closeIncomingCallActivity(true);
      if (itemBefore != null && itemBefore.closedWithAnswerPressed) {
        IncomingCallModule.emit("hold", itemBefore.uuid);
      }
    }else {
      IncomingCallModule.emit("backToForeground", "");
      mgr.finishAll();
    }


  }

  public void onBtnRejectClick(View v) {
    IncomingCallModule.emit("rejectCall", uuid);
    int numberActivity =  mgr.getNumberActivitys(this);
    mgr.pop();
    if(numberActivity == 1){
      ExitActivity.exitApplication(this);
    }else{
      forceFinish();
    }
  }

  public void onBtnTransferClick(View v) {
    IncomingCallModule.emit("transfer", uuid);
    mgr.finishAll();
    IncomingCallModule.emit("backToForeground", uuid);
  }

  public void onBtnParkClick(View v) {
    IncomingCallModule.emit("park", uuid);
    mgr.finishAll();
    IncomingCallModule.emit("backToForeground", uuid);
  }

  public void onBtnVideoClick(View v) {
    IncomingCallModule.emit("video", uuid);
    mgr.finishAll();
    IncomingCallModule.emit("backToForeground", uuid);

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
    mgr.finishAll();
  }

  public void updateUIBtnHold(Boolean isHold) {
    runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            btnHold.setSelected(isHold);
            txtHoldBtn.setText(isHold ? "HOLD" : "UNHOLD");
          }
        });
  }

  public void onBtnHoldClick(View v) {
    IncomingCallModule.emit("hold", uuid);
  }

  public void onBtnEndCallClick(View v) {
    IncomingCallModule.emit("endCall", uuid);
    int numberActivity =  mgr.getNumberActivitys(this);
    mgr.pop();
    if(numberActivity == 1){
      ExitActivity.exitApplication(this);
    }else{
      forceFinish();
    }
  }

  public void onBtnDeclineClick(View v) {
    IncomingCallModule.emit("rejectCall", uuid);
    forceFinish();
    mgr.pop();
  }

  public void onBtnHoldAcceptClick(View v) {
    IncomingCallModule.emit("answerCall", uuid);
    IncomingCallModule.emit("hold", mgr.getUuidOfBeforeItem(uuid));
    closeIncomingCallActivity(true);
  }

  public void onBtnEndAcceptClick(View v) {
    IncomingCallModule.emit("answerCall", uuid);
    IncomingCallModule.emit("endCall", mgr.getUuidOfBeforeItem(uuid));
    closeIncomingCallActivity(true);
  }

  public void onBtnUnlockClick(View v) {
    IncomingCallModule.emit("backToForeground","");
    mgr.finishAll();
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
        onBtnDeclineClick(v);
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
      mgr.removeUUID(uuid);
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
      // don't need, handle on event onAppBackgrounded
    }
  }

  @Override
  protected void onResume() {
    super.onResume();
    if (!closedWithAnswerPressed && mp == null) {
      startRingtone();
    }
  }

  @Override
  protected void onPause() {
    super.onPause();
  }

  @Override
  protected void onStop() {
    super.onStop();
  }

  @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
  private void onAppBackgrounded() {
    Log.d("DEV","onAppBackgrounded");
    if (mgr.isEmpty()) {
      return;
    }
    // event app in background
    if (mgr.last().uuid == uuid) {
      this.forceStopRingtone();
      IncomingCallModule.emit("backToForeground", "");
      km.requestDismissKeyguard(this, new KeyguardManager.KeyguardDismissCallback() {});
      mgr.finishAll();
    }
  }

  @OnLifecycleEvent(Lifecycle.Event.ON_START)
  private void onAppForegrounded() {
  }

  @Override
  protected void onDestroy() {
    // instead by event app in background
    forceStopRingtone();
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
    if (e.getKeyCode() == KeyEvent.KEYCODE_HOME) {
      Log.d("DEV", "onKeyDown::KEYCODE_HOME");
    }
    return super.onKeyDown(k, e);
  }

  @Override
  public boolean dispatchKeyEvent(KeyEvent e) {
    return onKeyDown(e.getAction(), e);
  }
}
