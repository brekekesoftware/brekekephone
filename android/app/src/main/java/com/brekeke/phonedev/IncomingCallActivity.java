package com.brekeke.phonedev;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;
import com.bumptech.glide.Glide;
import com.oney.WebRTCModule.WebRTCView;
import io.wazo.callkeep.RNCallKeepModule;

public class IncomingCallActivity extends Activity implements View.OnClickListener {
  public RelativeLayout vWebrtc,
      vIncomingCall,
      vCallManage,
      vCallManageLoading,
      vHeaderIncomingCall,
      vHeaderManageCall;
  public LinearLayout vCallManageControls;
  public View vCardAvatar;
  public View vCardAvatarTalking;
  public WebRTCView vWebrtcVideo;
  public ImageView imgAvatar;
  public ImageView imgAvatarTalking;
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
      txtHeaderCallerName,
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
  public String uuid, callerName, avatar, avatarSize, talkingAvatar = "";
  public boolean destroyed = false, paused = false, answered = false, isLarge = false;

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
    avatar = b.getString("avatar");
    avatarSize = b.getString("avatarSize");

    if ("rejectCall".equals(BrekekeModule.userActions.get(uuid))) {
      forceFinish();
      RNCallKeepModule.staticEndCall(uuid);
      return;
    }
    // Just to make sure we'll use interval here
    BrekekeModule.intervalCheckRejectCall(uuid);

    getWindow()
        .addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);

    setContentView(R.layout.incoming_call_activity);
    BrekekeModule.activities.add(this);
    BrekekeModule.startRingtone();

    vHeaderIncomingCall = (RelativeLayout) findViewById(R.id.header_incoming);
    vHeaderManageCall = (RelativeLayout) findViewById(R.id.header_manage_call);
    vWebrtc = (RelativeLayout) findViewById(R.id.view_webrtc);
    vIncomingCall = (RelativeLayout) findViewById(R.id.view_incoming_call);
    vCallManage = (RelativeLayout) findViewById(R.id.view_call_manage);
    vCallManageLoading = (RelativeLayout) findViewById(R.id.view_call_manage_loading);
    vCallManageControls = (LinearLayout) findViewById(R.id.view_call_manage_controls);
    vCardAvatarTalking = (View) findViewById(R.id.card_avatar_talking);
    vCardAvatar = (View) findViewById(R.id.card_avatar);
    vCallManage.setOnClickListener(this);

    imgAvatar = (ImageView) findViewById(R.id.avatar);
    imgAvatarTalking = (ImageView) findViewById(R.id.avatar_talking);
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
    txtHeaderCallerName = (TextView) findViewById(R.id.txt_header_caller_name);
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
    txtHeaderCallerName.setText(callerName);
    updateLabels();
    updateHeader();
  }

  public void updateHeader() {
    if ("large".equalsIgnoreCase(avatarSize)) {
      DisplayMetrics displayMetrics = new DisplayMetrics();
      getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
      int height = displayMetrics.heightPixels;
      int width = displayMetrics.widthPixels;
      // CardAvatar Layout
      vCardAvatar.getLayoutParams().height = (int) (height / 2.2);
      vCardAvatar.getLayoutParams().width = width - 60;
      GradientDrawable shape = new GradientDrawable();
      shape.setCornerRadius(0);
      vCardAvatar.setBackground(shape);
      vCardAvatar.setBackgroundColor(Color.WHITE);
      // TextIncomingCall margin
      RelativeLayout.LayoutParams params =
          new RelativeLayout.LayoutParams(
              RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.WRAP_CONTENT);
      params.setMargins(0, (int) (height / 1.4), 0, 0);
      txtIncomingCall.setLayoutParams(params);
    }
    Glide.with(this)
        .load(
            avatar != null && !avatar.isEmpty()
                ? avatar
                : getResources().getIdentifier("default_avatar", "mipmap", getPackageName()))
        .centerCrop()
        .into(imgAvatar);
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
        BrekekeModule.jsCallsSize > BrekekeModule.activitiesSize
            ? BrekekeModule.jsCallsSize
            : BrekekeModule.activitiesSize;
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
    vWebrtcVideo = new WebRTCView(BrekekeModule.ctx);
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

  private void updateLayoutManagerCall() {
    GradientDrawable shape = new GradientDrawable();
    DisplayMetrics displayMetrics = new DisplayMetrics();
    getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
    ConstraintLayout constraintLayout = findViewById(R.id.call_manager_layout);
    ConstraintSet constraintSet = new ConstraintSet();
    int height = displayMetrics.heightPixels;
    boolean isLargeDevice = height > 1200;
    int flexValue = height / 6;
    vCardAvatarTalking.setBackgroundColor(Color.WHITE);
    vCardAvatarTalking.getLayoutParams().height = flexValue;
    vCardAvatarTalking.getLayoutParams().width = flexValue;
    shape.setCornerRadius(flexValue / 2);
    constraintSet.clone(constraintLayout);
    constraintSet.connect(
        R.id.btn_unlock, ConstraintSet.TOP, R.id.card_avatar_talking, ConstraintSet.BOTTOM, 12);
    constraintSet.connect(
        R.id.view_call_manage_controls,
        ConstraintSet.BOTTOM,
        R.id.view_button_end,
        ConstraintSet.TOP,
        isLargeDevice ? flexValue / 2 : 30);
    constraintSet.connect(
        R.id.card_avatar_talking,
        ConstraintSet.TOP,
        ConstraintSet.PARENT_ID,
        ConstraintSet.TOP,
        (int) (flexValue / 1.1));
    constraintSet.connect(
        R.id.view_button_end,
        ConstraintSet.BOTTOM,
        ConstraintSet.PARENT_ID,
        ConstraintSet.BOTTOM,
        isLargeDevice ? flexValue / 2 : 30);
    vCardAvatarTalking.setBackground(shape);
    constraintSet.applyTo(constraintLayout);
  }

  private void updateLayoutManagerCallLoading() {
    ConstraintLayout constraintLayout = findViewById(R.id.call_manager_layout);
    ConstraintSet constraintSet = new ConstraintSet();
    constraintSet.clone(constraintLayout);
    constraintSet.connect(
        R.id.btn_unlock, ConstraintSet.TOP, ConstraintSet.PARENT_ID, ConstraintSet.TOP, 50);
    constraintSet.connect(
        R.id.view_call_manage_loading,
        ConstraintSet.TOP,
        R.id.btn_unlock,
        ConstraintSet.BOTTOM,
        40);
    constraintSet.clear(R.id.view_call_manage_loading, ConstraintSet.BOTTOM);
    constraintSet.applyTo(constraintLayout);
  }

  private void updateLayoutManagerCallLoaded() {
    ConstraintLayout constraintLayout = findViewById(R.id.call_manager_layout);
    ConstraintSet constraintSet = new ConstraintSet();
    constraintSet.clone(constraintLayout);
    constraintSet.clear(R.id.btn_unlock, ConstraintSet.TOP);
    constraintSet.connect(
        R.id.btn_unlock,
        ConstraintSet.BOTTOM,
        R.id.view_call_manage_controls,
        ConstraintSet.TOP,
        20);
    constraintSet.connect(
        R.id.view_call_manage_loading,
        ConstraintSet.BOTTOM,
        R.id.view_call_manage_controls,
        ConstraintSet.TOP,
        20);
    constraintSet.clear(R.id.view_call_manage_loading, ConstraintSet.TOP);
    constraintSet.applyTo(constraintLayout);
  }

  public void onBtnAnswerClick(View v) {
    BrekekeModule.putUserActionAnswerCall(uuid);
    BrekekeModule.emit("answerCall", uuid);
    if (BrekekeModule.isLocked()) {
      if (talkingAvatar != null && !talkingAvatar.isEmpty()) {
        if (!isLarge) {
          updateLayoutManagerCall();
        }
        Glide.with(this).load(talkingAvatar).centerCrop().into(imgAvatarTalking);
      }
      answered = true;
      BrekekeModule.stopRingtone();
      vIncomingCall.setVisibility(View.GONE);
      vHeaderIncomingCall.setVisibility(View.GONE);
      vHeaderManageCall.setVisibility(View.VISIBLE);
      vCallManage.setVisibility(View.VISIBLE);
      if (v != null) {
        vCardAvatarTalking.setVisibility(View.GONE);
        vCallManageControls.setVisibility(View.GONE);
        updateLayoutManagerCallLoading();
      }
    } else {
      BrekekeModule.removeAllAndBackToForeground();
    }
  }

  public void onBtnRejectClick(View v) {
    BrekekeModule.putUserActionRejectCall(uuid);
    BrekekeModule.emit("rejectCall", uuid);
    answered = false;
    BrekekeModule.remove(uuid);
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
    BrekekeModule.emit("transfer", uuid);
  }

  public void onBtnParkClick(View v) {
    BrekekeModule.emit("park", uuid);
  }

  public void onBtnVideoClick(View v) {
    BrekekeModule.emit("video", uuid);
  }

  public void onBtnSpeakerClick(View v) {
    btnSpeaker.setSelected(!v.isSelected());
    BrekekeModule.emit("speaker", uuid);
  }

  public void onBtnMuteClick(View v) {
    btnMute.setSelected(!v.isSelected());
    updateMuteBtnLabel();
    BrekekeModule.emit("mute", uuid);
  }

  public void onBtnRecordClick(View v) {
    btnRecord.setSelected(!v.isSelected());
    BrekekeModule.emit("record", uuid);
  }

  public void onBtnDtmfClick(View v) {
    BrekekeModule.emit("dtmf", uuid);
  }

  public void onBtnHoldClick(View v) {
    BrekekeModule.emit("hold", uuid);
  }

  public void onRequestUnlock(View v) {
    BrekekeModule.km.requestDismissKeyguard(
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
    BrekekeModule.removeAllAndBackToForeground();
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

  public void onCallConnected() {
    vCallManageLoading.setVisibility(View.GONE);
    vCardAvatarTalking.setVisibility(View.VISIBLE);
    vCallManageControls.setVisibility(View.VISIBLE);
    updateLayoutManagerCallLoaded();
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

  public void setImageTalkingUrl(String url, Boolean isLarge) {
    this.talkingAvatar = url;
    this.isLarge = isLarge;
  }

  public void forceFinish() {
    destroyed = true;
    try {
      finish();
    } catch (Exception e) {
    }
  }

  public void reorderToFront() {
    Intent i = new Intent(this, IncomingCallActivity.class);
    i.setFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
    startActivity(i);
  }

  @Override
  protected void onPause() {
    paused = true;
    BrekekeModule.onActivityPauseOrDestroy(uuid, false);
    super.onPause();
  }

  @Override
  protected void onResume() {
    if (!answered) {
      BrekekeModule.startRingtone();
    } else if (!BrekekeModule.isLocked()) {
      // User press home button, unlock the screen, then open app
      BrekekeModule.removeAllAndBackToForeground();
    }
    paused = false;
    super.onResume();
  }

  @Override
  protected void onDestroy() {
    destroyed = true;
    BrekekeModule.onActivityPauseOrDestroy(uuid, true);
    super.onDestroy();
  }

  @Override
  public boolean onKeyDown(int k, KeyEvent e) {
    BrekekeModule.stopRingtone();
    return super.onKeyDown(k, e);
  }

  @Override
  public boolean dispatchKeyEvent(KeyEvent e) {
    return onKeyDown(e.getAction(), e);
  }
}
