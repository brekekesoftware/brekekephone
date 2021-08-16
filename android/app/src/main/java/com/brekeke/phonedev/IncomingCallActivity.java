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
import android.widget.TextView;
import androidx.annotation.Nullable;

public class IncomingCallActivity extends Activity implements View.OnClickListener {
  public MediaPlayer mp;

  public View vIncomingCall, vCallManage, vCallManageLoading, vCallManageControls;
  public Button btnAnswer,
      btnReject,
      btnUnlock,
      btnTransfer,
      btnPark,
      btnVideo,
      btnSpeaker,
      btnMute,
      btnRecord,
      btnDtmf,
      btnHold,
      btnEndcall;
  public TextView txtCallerName,
      txtIncomingCall,
      txtLoading,
      txtTransferBtn,
      txtParkBtn,
      txtVideoBtn,
      txtSpeakerBtn,
      txtMuteBtn,
      txtRecordBtn,
      txtDtmfBtn,
      txtHoldBtn,
      txtCallOnHold;
  public String uuid, callerName;
  public boolean closed = false, paused = false, answered = false;

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    IncomingCallModule.activities.add(this);
    startRingtone();
    Bundle b = getIntent().getExtras();
    if (b == null) {
      b = savedInstanceState;
    }
    if (b == null) {
      int i = 0;
      for (IncomingCallActivity a : IncomingCallModule.activities) {
        if (a == this) {
          IncomingCallModule.activities.remove(i);
          break;
        }
        i++;
      }
      this.forceFinish();
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

    vIncomingCall = findViewById(R.id.view_incoming_call);
    vCallManage = findViewById(R.id.view_call_manage);
    vCallManageLoading = findViewById(R.id.view_call_manage_loading);
    vCallManageControls = findViewById(R.id.view_call_manage_controls);

    vIncomingCall.setVisibility(View.VISIBLE);

    btnAnswer = (Button) findViewById(R.id.btn_answer);
    btnReject = (Button) findViewById(R.id.btn_reject);

    btnUnlock = (Button) findViewById(R.id.btn_unlock);
    btnTransfer = (Button) findViewById(R.id.btn_transfer);
    btnPark = (Button) findViewById(R.id.btn_park);
    btnVideo = (Button) findViewById(R.id.btn_video);
    btnSpeaker = (Button) findViewById(R.id.btn_speaker);
    btnMute = (Button) findViewById(R.id.btn_mute);
    btnRecord = (Button) findViewById(R.id.btn_record);
    btnDtmf = (Button) findViewById(R.id.btn_dtmf);
    btnHold = (Button) findViewById(R.id.btn_hold);
    btnEndcall = (Button) findViewById(R.id.btn_end_call);

    btnAnswer.setOnClickListener(this);
    btnReject.setOnClickListener(this);

    btnUnlock.setOnClickListener(this);
    btnTransfer.setOnClickListener(this);
    btnPark.setOnClickListener(this);
    btnVideo.setOnClickListener(this);
    btnSpeaker.setOnClickListener(this);
    btnMute.setOnClickListener(this);
    btnRecord.setOnClickListener(this);
    btnDtmf.setOnClickListener(this);
    btnHold.setOnClickListener(this);
    btnEndcall.setOnClickListener(this);

    txtCallerName = (TextView) findViewById(R.id.txt_caller_name);
    txtIncomingCall = (TextView) findViewById(R.id.txt_incoming_call);
    txtLoading = (TextView) findViewById(R.id.txt_loading);
    txtTransferBtn = (TextView) findViewById(R.id.txt_transfer_btn);
    txtParkBtn = (TextView) findViewById(R.id.txt_park_btn);
    txtVideoBtn = (TextView) findViewById(R.id.txt_video_btn);
    txtSpeakerBtn = (TextView) findViewById(R.id.txt_speaker_btn);
    txtMuteBtn = (TextView) findViewById(R.id.txt_mute_btn);
    txtRecordBtn = (TextView) findViewById(R.id.txt_record_btn);
    txtDtmfBtn = (TextView) findViewById(R.id.txt_dtmf_btn);
    txtHoldBtn = (TextView) findViewById(R.id.txt_hold_btn);
    txtCallOnHold = (TextView) findViewById(R.id.txt_call_on_hold);

    txtCallerName.setText(callerName);
    // TODO handle locale here

    uiSetBackgroundCalls(IncomingCallModule.callsSize);
  }

  // vIncomingCall

  public void onBtnAnswerClick(View v) {
    IncomingCallModule.userActions.put(uuid, "answerCall");
    IncomingCallModule.emit("answerCall", uuid);
    if (IncomingCallModule.isLocked()) {
      answered = true;
      forceStopRingtone();
      vIncomingCall.setVisibility(View.GONE);
      vCallManage.setVisibility(View.VISIBLE);
    } else {
      IncomingCallModule.removeAllAndBackToForeground();
    }
  }

  public void onBtnRejectClick(View v) {
    IncomingCallModule.userActions.put(uuid, "rejectCall");
    IncomingCallModule.emit("rejectCall", uuid);
    answered = false;
    IncomingCallModule.remove(uuid);
  }

  // vCallManage

  public void onBtnUnlockClick(View v) {
    // Already invoked in onKeyguardDismissSucceeded
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

  public void onBtnHoldClick(View v) {
    IncomingCallModule.emit("hold", uuid);
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
      case R.id.btn_dtmf:
        onBtnDtmfClick(v);
        break;
      default:
        break;
    }
    IncomingCallModule.removeAllAndBackToForeground();
  }

  @Override
  public void onClick(View v) {
    switch (v.getId()) {
        // vIncomingCall
      case R.id.btn_answer:
        onBtnAnswerClick(v);
        break;
      case R.id.btn_reject:
        onBtnRejectClick(v);
        break;
        // vCallManage
      case R.id.btn_unlock:
        onRequestUnlock(v);
        break;
      case R.id.btn_transfer:
        onRequestUnlock(v);
        break;
      case R.id.btn_park:
        onRequestUnlock(v);
        break;
      case R.id.btn_video:
        onBtnVideoClick(v);
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

  public void onConnectingCallSuccess() {
    runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            vCallManageLoading.setVisibility(View.GONE);
            vCallManageControls.setVisibility(View.VISIBLE);
          }
        });
  }

  public void uiSetBtnVideo(boolean isVideoCall) {
    runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              btnVideo.setSelected(isVideoCall);
            } catch (Exception e) {
            }
          }
        });
  }

  public void uiSetBtnHold(boolean holding) {
    runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              btnHold.setSelected(holding);
              txtHoldBtn.setText(holding ? "UNHOLD" : "HOLD");
              if (holding) {
                btnEndcall.setVisibility(View.GONE);
                txtCallOnHold.setVisibility(View.VISIBLE);
              } else {
                btnEndcall.setVisibility(View.VISIBLE);
                txtCallOnHold.setVisibility(View.GONE);
              }
            } catch (Exception e) {
            }
          }
        });
  }

  public void uiSetBackgroundCalls(int n) {
    runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              int n2 =
                  n > IncomingCallModule.activitiesSize ? n : IncomingCallModule.activitiesSize;
              btnUnlock.setText(
                  n2 <= 1
                      ? "UNLOCK"
                      : ""
                          + (n2 - 1)
                          + " OTHER CALL"
                          + (n2 > 2 ? "S ARE" : " IS")
                          + " IN BACKGROUND");
            } catch (Exception e) {
            }
          }
        });
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
    IncomingCallModule.onActivityPauseOrDestroy();
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
    IncomingCallModule.onActivityPauseOrDestroy();
    IncomingCallModule.activitiesSize--;
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
