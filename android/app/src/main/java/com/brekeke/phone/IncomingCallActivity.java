package com.brekeke.phone;

import android.app.Activity;
import android.app.KeyguardManager;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import androidx.annotation.Nullable;
import com.oney.WebRTCModule.WebRTCView;
import io.wazo.callkeep.RNCallKeepModule;

public class IncomingCallActivity extends Activity implements View.OnClickListener {
  public RelativeLayout vWebrtc, vIncomingCall, vCallManage, vCallManageLoading;
  public LinearLayout vCallManageControls;
  public WebRTCView vWebrtcVideo;
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
      txtConnecting,
      txtTransferBtn,
      txtParkBtn,
      txtVideoBtn,
      txtSpeakerBtn,
      txtMuteBtn,
      txtRecordBtn,
      txtDtmfBtn,
      txtHoldBtn,
      txtCallIsOnHold;
  public String uuid, callerName;
  public boolean destroyed = false, paused = false, answered = false;

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Bundle b = getIntent().getExtras();
    if (b == null) {
      b = savedInstanceState;
    }
    if (b == null) {
      forceFinish();
      return;
    }

    uuid = b.getString("uuid");
    callerName = b.getString("callerName");
    if ("rejectCall".equals(IncomingCallModule.userActions.get(uuid))) {
      forceFinish();
      RNCallKeepModule.staticEndCall(uuid);
      return;
    }
    // Just to make sure we'll use interval here
    IncomingCallModule.intervalCheckRejectCall(uuid);

    getWindow()
        .addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);

    setContentView(R.layout.incoming_call_activity);
    IncomingCallModule.activities.add(this);
    IncomingCallModule.startRingtone();

    vWebrtc = (RelativeLayout) findViewById(R.id.view_webrtc);
    vIncomingCall = (RelativeLayout) findViewById(R.id.view_incoming_call);
    vCallManage = (RelativeLayout) findViewById(R.id.view_call_manage);
    vCallManageLoading = (RelativeLayout) findViewById(R.id.view_call_manage_loading);
    vCallManageControls = (LinearLayout) findViewById(R.id.view_call_manage_controls);

    vCallManage.setOnClickListener(this);

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
    txtConnecting = (TextView) findViewById(R.id.txt_connecting);
    txtTransferBtn = (TextView) findViewById(R.id.txt_transfer_btn);
    txtParkBtn = (TextView) findViewById(R.id.txt_park_btn);
    txtVideoBtn = (TextView) findViewById(R.id.txt_video_btn);
    txtSpeakerBtn = (TextView) findViewById(R.id.txt_speaker_btn);
    txtMuteBtn = (TextView) findViewById(R.id.txt_mute_btn);
    txtRecordBtn = (TextView) findViewById(R.id.txt_record_btn);
    txtDtmfBtn = (TextView) findViewById(R.id.txt_dtmf_btn);
    txtHoldBtn = (TextView) findViewById(R.id.txt_hold_btn);
    txtCallIsOnHold = (TextView) findViewById(R.id.txt_call_is_on_hold);

    txtCallerName.setText(callerName);
    updateLabels();
  }

  public void updateLabels() {
    updateBtnUnlockLabel();
    txtIncomingCall.setText(L.incomingCall());
    txtConnecting.setText(L.connecting());
    txtTransferBtn.setText(L.transfer());
    txtParkBtn.setText(L.park());
    txtVideoBtn.setText(L.video());
    txtSpeakerBtn.setText(L.speaker());
    updateMuteBtnLabel();
    txtRecordBtn.setText(L.record());
    txtDtmfBtn.setText(L.dtmf());
    updateBtnHoldLabel();
    txtCallIsOnHold.setText(L.callIsOnHold());
  }

  public void updateBtnUnlockLabel() {
    int n =
        IncomingCallModule.callsSize > IncomingCallModule.activitiesSize
            ? IncomingCallModule.callsSize
            : IncomingCallModule.activitiesSize;
    btnUnlock.setText(n <= 1 ? L.unlock() : L.nCallsInBackground(n - 1));
  }

  public void updateMuteBtnLabel() {
    txtMuteBtn.setText(btnMute.isSelected() ? L.unmute() : L.mute());
  }

  public void updateBtnHoldLabel() {
    txtHoldBtn.setText(btnHold.isSelected() ? L.unhold() : L.hold());
  }

  // vWebrtc

  public void initWebrtcVideo() {
    if (vWebrtcVideo != null) {
      return;
    }
    vWebrtcVideo = new WebRTCView(IncomingCallModule.ctx);
    vWebrtcVideo.setLayoutParams(
        new RelativeLayout.LayoutParams(
            RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.MATCH_PARENT));
    vWebrtcVideo.setObjectFit("cover");
    vWebrtc.addView(vWebrtcVideo);
    vWebrtc.setVisibility(View.VISIBLE);
  }

  public void setRemoteVideoStreamURL(String url) {
    if (url == null || "".equals(url)) {
      if (vWebrtcVideo == null) {
        return;
      }
      vWebrtc.setVisibility(View.GONE);
      vWebrtc.removeView(vWebrtcVideo);
      vWebrtcVideo = null;
      showCallManageControls();
    } else {
      initWebrtcVideo();
      vWebrtcVideo.setStreamURL(url);
      if (!hasManuallyToggledCallManageControls) {
        hideCallManageControls();
      }
    }
  }

  // Show/hide call manage controls in video call
  public boolean hasManuallyToggledCallManageControls = false;
  public boolean isCallManageControlsHidden = false;

  public void toggleCallManageControls() {
    if (isCallManageControlsHidden) {
      showCallManageControls();
    } else {
      hideCallManageControls();
    }
  }

  public void showCallManageControls() {
    isCallManageControlsHidden = false;
    vCallManageControls.setVisibility(View.VISIBLE);
    btnUnlock.setVisibility(View.VISIBLE);
  }

  public void hideCallManageControls() {
    isCallManageControlsHidden = true;
    vCallManageControls.setVisibility(View.GONE);
    btnUnlock.setVisibility(View.GONE);
  }

  // vIncomingCall

  public void onBtnAnswerClick(View v) {
    IncomingCallModule.putUserActionAnswerCall(uuid);
    IncomingCallModule.emit("answerCall", uuid);
    if (IncomingCallModule.isLocked()) {
      answered = true;
      IncomingCallModule.stopRingtone();
      vIncomingCall.setVisibility(View.GONE);
      vCallManage.setVisibility(View.VISIBLE);
    } else {
      IncomingCallModule.removeAllAndBackToForeground();
    }
  }

  public void onBtnRejectClick(View v) {
    IncomingCallModule.putUserActionRejectCall(uuid);
    IncomingCallModule.emit("rejectCall", uuid);
    answered = false;
    IncomingCallModule.remove(uuid);
  }

  // vCallManage
  public void onViewCallManageClick(View v) {
    if (vWebrtcVideo == null) {
      return;
    }
    hasManuallyToggledCallManageControls = true;
    toggleCallManageControls();
  }

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
    btnSpeaker.setSelected(!v.isSelected());
    IncomingCallModule.emit("speaker", uuid);
  }

  public void onBtnMuteClick(View v) {
    btnMute.setSelected(!v.isSelected());
    updateMuteBtnLabel();
    IncomingCallModule.emit("mute", uuid);
  }

  public void onBtnRecordClick(View v) {
    btnRecord.setSelected(!v.isSelected());
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
      case R.id.btn_video:
        onBtnVideoClick(v);
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
      case R.id.view_call_manage:
        onViewCallManageClick(v);
        break;
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
    vCallManageLoading.setVisibility(View.GONE);
    vCallManageControls.setVisibility(View.VISIBLE);
  }

  public void setBtnVideoSelected(boolean isVideoCall) {
    btnVideo.setSelected(isVideoCall);
  }

  public void setBtnHoldSelected(boolean holding) {
    btnHold.setSelected(holding);
    updateBtnHoldLabel();
    btnEndcall.setVisibility(holding ? View.GONE : View.VISIBLE);
    txtCallIsOnHold.setVisibility(holding ? View.VISIBLE : View.GONE);
  }

  public void forceFinish() {
    destroyed = true;
    try {
      finish();
    } catch (Exception e) {
    }
  }

  @Override
  protected void onPause() {
    paused = true;
    IncomingCallModule.onActivityPauseOrDestroy(uuid, false);
    super.onPause();
  }

  @Override
  protected void onResume() {
    if (!answered) {
      IncomingCallModule.startRingtone();
    } else if (!IncomingCallModule.isLocked()) {
      // User press home button, unlock the screen, then open app
      IncomingCallModule.removeAllAndBackToForeground();
    }
    paused = false;
    super.onResume();
  }

  @Override
  protected void onDestroy() {
    destroyed = true;
    IncomingCallModule.onActivityPauseOrDestroy(uuid, true);
    super.onDestroy();
  }

  @Override
  public boolean onKeyDown(int k, KeyEvent e) {
    IncomingCallModule.stopRingtone();
    return super.onKeyDown(k, e);
  }

  @Override
  public boolean dispatchKeyEvent(KeyEvent e) {
    return onKeyDown(e.getAction(), e);
  }
}
