package com.brekeke.phonedev;

import android.Manifest.permission;
import android.app.Activity;
import android.app.KeyguardManager;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.os.Bundle;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;
import androidx.swiperefreshlayout.widget.CircularProgressDrawable;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.oney.WebRTCModule.WebRTCView;
import io.wazo.callkeep.RNCallKeepModule;
import java.util.Timer;
import java.util.TimerTask;
import org.json.JSONObject;

public class IncomingCallActivity extends Activity implements View.OnClickListener {
  public RelativeLayout vWebrtc,
      vIncomingCall,
      vCallManage,
      vCallManageLoading,
      vHeaderIncomingCall,
      vWebViewAvatarLoading,
      vWebViewAvatarTalkingLoading;
  public LinearLayout vNavHeader,
      vCallManageControls,
      vBtnTransfer,
      vBtnPark,
      vBtnVideo,
      vBtnSpeaker,
      vBtnMute,
      vBtnRecord,
      vBtnDTMF,
      vBtnHold;
  public WebRTCView vWebrtcVideo;
  public ProgressBar videoLoading;
  public View vCardAvatar, vCardAvatarTalking;
  public ImageView imgAvatar, imgAvatarTalking;
  public CircularProgressDrawable imgAvatarLoadingProgress;
  public WebView webViewAvatar, webViewAvatarTalking;
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
      btnEndCall,
      btnSwitchCamera,
      btnBack;
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
      txtCallIsOnHold,
      txtDurationCall,
      txtCallerNameHeader;
  public String uuid, callerName, avatar, avatarSize, talkingAvatar = "";
  public boolean destroyed = false,
      paused = false,
      answered = false,
      isLarge = false,
      isVideoCall = false;

  public JSONObject pbxConfig;
  public JSONObject callConfig;
  final int PERMISSIONS_REQUEST_CODE = 1222;

  // ==========================================================================
  // activity lifecycles
  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Bundle b = getIntent().getExtras();
    if (b == null) {
      b = savedInstanceState;
    }
    if (b == null) {
      debug("onCreate bundle=null");
      forceFinish();
      return;
    }

    timer = new Timer();
    uuid = b.getString("uuid");
    callerName = b.getString("callerName");
    avatar = b.getString("avatar");
    avatarSize = b.getString("avatarSize");

    if ("rejectCall".equals(BrekekeUtils.userActions.get(uuid))) {
      debug("onCreate rejectCall");
      forceFinish();
      RNCallKeepModule.staticEndCall(uuid, this);
      return;
    }
    // just to make sure we'll use interval here
    BrekekeUtils.intervalCheckRejectCall(uuid);

    getWindow()
        .addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);

    setContentView(R.layout.incoming_call_activity);
    BrekekeUtils.activities.add(this);
    BrekekeUtils.staticStartRingtone();

    imgAvatarLoadingProgress = new CircularProgressDrawable(this);
    imgAvatarLoadingProgress.setColorSchemeColors(R.color.black, R.color.black, R.color.black);
    imgAvatarLoadingProgress.setCenterRadius(30f);
    imgAvatarLoadingProgress.setStrokeWidth(5f);
    imgAvatarLoadingProgress.start();

    vNavHeader = (LinearLayout) findViewById(R.id.view_nav_header);
    vHeaderIncomingCall = (RelativeLayout) findViewById(R.id.header_incoming);
    vWebrtc = (RelativeLayout) findViewById(R.id.view_webrtc);
    vIncomingCall = (RelativeLayout) findViewById(R.id.view_incoming_call);
    vCallManage = (RelativeLayout) findViewById(R.id.view_call_manage);
    vCallManageLoading = (RelativeLayout) findViewById(R.id.view_call_manage_loading);
    vCallManageControls = (LinearLayout) findViewById(R.id.view_call_manage_controls);
    vCardAvatarTalking = (View) findViewById(R.id.card_avatar_talking);
    vCardAvatar = (View) findViewById(R.id.card_avatar);
    videoLoading = (ProgressBar) findViewById(R.id.video_loading);
    vWebViewAvatarLoading = (RelativeLayout) findViewById(R.id.rl_webview_loading);
    vWebViewAvatarTalkingLoading = (RelativeLayout) findViewById(R.id.rl_taking_loading);
    vCallManage.setOnClickListener(this);

    vBtnTransfer = (LinearLayout) findViewById(R.id.ln_btn_transfer);
    vBtnPark = (LinearLayout) findViewById(R.id.ln_btn_park);
    vBtnVideo = (LinearLayout) findViewById(R.id.ln_btn_video);
    vBtnSpeaker = (LinearLayout) findViewById(R.id.ln_btn_speaker);
    vBtnMute = (LinearLayout) findViewById(R.id.ln_btn_mute);
    vBtnRecord = (LinearLayout) findViewById(R.id.ln_btn_record);
    vBtnDTMF = (LinearLayout) findViewById(R.id.ln_btn_dtmf);
    vBtnHold = (LinearLayout) findViewById(R.id.ln_btn_hold);

    webViewAvatar = (WebView) findViewById(R.id.avatar_html);
    webViewAvatar.setBackgroundColor(Color.WHITE);
    webViewAvatar.getSettings().setBuiltInZoomControls(false);
    webViewAvatar.getSettings().setSupportZoom(true);
    webViewAvatar.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
    webViewAvatar.getSettings().setJavaScriptEnabled(true);
    webViewAvatar.getSettings().setAllowFileAccess(true);
    webViewAvatar.getSettings().setDomStorageEnabled(true);

    webViewAvatarTalking = (WebView) findViewById(R.id.avatar_talking_html);
    webViewAvatarTalking.setBackgroundColor(Color.WHITE);
    webViewAvatarTalking.getSettings().setBuiltInZoomControls(false);
    webViewAvatarTalking.getSettings().setSupportZoom(true);
    webViewAvatarTalking.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
    webViewAvatarTalking.getSettings().setAllowFileAccess(true);
    webViewAvatarTalking.getSettings().setDomStorageEnabled(true);
    webViewAvatarTalking.getSettings().setJavaScriptEnabled(true);

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
    btnEndCall = (Button) findViewById(R.id.btn_end_call);
    btnSwitchCamera = (Button) findViewById(R.id.btn_switch_camera);
    btnBack = (Button) findViewById(R.id.btn_back);

    btnBack.setOnClickListener(this);
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
    btnEndCall.setOnClickListener(this);
    btnSwitchCamera.setOnClickListener(this);
    btnSwitchCamera.setSelected(true); // default front camera

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
    txtDurationCall = (TextView) findViewById(R.id.txt_count_timer);
    txtCallerNameHeader = (TextView) findViewById(R.id.txt_caller_name_header);

    txtCallerName.setText(callerName);
    txtHeaderCallerName.setText(callerName);
    txtCallerNameHeader.setText(callerName);

    updateLabels();
    updateHeader();
    updateCallConfig();
  }

  @Override
  protected void onNewIntent(Intent intent) {
    debug("onNewIntent");
    super.onNewIntent(intent);
  }

  @Override
  protected void onPause() {
    debug("onPause");
    paused = true;
    super.onPause();
  }

  @Override
  protected void onResume() {
    super.onResume();
    debug("onResume answered=" + answered);
    if (!answered) {
      BrekekeUtils.staticStartRingtone();
    } else {
      BrekekeUtils.emit("switchCall", uuid);
    }
    paused = false;
  }

  @Override
  protected void onDestroy() {
    debug("onDestroy");
    destroyAvatarWebView();
    destroyAvatarTalkingWebView();
    destroyed = true;
    try {
      timer.cancel();
      timerTask.cancel();
    } catch (Exception e) {
    }
    timerTask = null;
    timer = null;
    BrekekeUtils.onActivityDestroy(uuid);
    onBtnRejectClick(null);
    super.onDestroy();
  }

  public void openMainActivity() {
    Intent i = new Intent(this, MainActivity.class);
    if (BrekekeUtils.main != null) {
      i.setFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
    } else {
      i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_MULTIPLE_TASK);
    }
    startActivity(i);
  }

  public void onBackPressed() {
    debug("onBackPressed");
    BrekekeUtils.emit("onIncomingCallActivityBackPressed", "");
    openMainActivity();
  }

  public void updateCallConfig() {
    updateBtnDisabled("hangup", btnReject);
    updateBtnDisabled("hangup", btnEndCall);
    updateBtnDisabled("transfer", vBtnTransfer);
    updateBtnDisabled("park", vBtnPark);
    updateBtnDisabled("video", vBtnVideo);
    updateBtnDisabled("speaker", vBtnSpeaker);
    updateBtnDisabled("mute", vBtnMute);
    updateBtnDisabled("record", vBtnRecord);
    updateBtnDisabled("dtmf", vBtnDTMF);
    updateBtnDisabled("hold", vBtnHold);
  }

  private void updateBtnDisabled(String k, View v) {
    try {
      boolean disabled =
          callConfig != null && callConfig.has(k)
              ? callConfig.getString(k).equals("false")
              : (pbxConfig != null && pbxConfig.has(k) && pbxConfig.getString(k).equals("false"));
      if ("hangup".equals(k) && btnHold.isSelected()) {
        disabled = true;
      }
      v.setVisibility(disabled ? View.GONE : View.VISIBLE);
    } catch (Exception e) {
    }
  }

  public void destroyAvatarWebView() {
    try {
      webViewAvatar.getSettings().setJavaScriptEnabled(false);
      webViewAvatar.destroy();
    } catch (Exception e) {
      debug("destroyAvatarWebView: " + e.toString());
    }
  }

  public void destroyAvatarTalkingWebView() {
    try {
      webViewAvatarTalking.getSettings().setJavaScriptEnabled(false);
      webViewAvatarTalking.destroy();
    } catch (Exception e) {
      debug("destroyAvatarTalkingWebView: " + e.toString());
    }
  }

  public void updateHeader() {
    if ("large".equalsIgnoreCase(avatarSize)) {
      DisplayMetrics displayMetrics = new DisplayMetrics();
      getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
      int height = (int) (displayMetrics.heightPixels * 4 / 10);
      // layout for vCardAvatar
      vCardAvatar.getLayoutParams().height = height;
      vCardAvatar.getLayoutParams().width = height;
      GradientDrawable shape = new GradientDrawable();
      shape.setCornerRadius(0);
      vCardAvatar.setBackground(shape);
      vCardAvatar.setBackgroundColor(Color.WHITE);
      // margin for txtIncomingCall
      RelativeLayout.LayoutParams params =
          new RelativeLayout.LayoutParams(
              RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.WRAP_CONTENT);
      params.setMargins(0, (int) (height * 1.5), 0, 0);
      txtIncomingCall.setLayoutParams(params);
    }
    // handle avatar for incomming call
    if (avatar == null || avatar.isEmpty()) {
      vCardAvatar.getLayoutParams().height = 0;
    } else if (!BrekekeUtils.isImageUrl(avatar)) {
      webViewAvatar.setVisibility(View.VISIBLE);
      imgAvatar.setVisibility(View.GONE);
      webViewAvatar.setWebViewClient(
          new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
              super.onPageStarted(view, url, favicon);
              vWebViewAvatarLoading.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
              super.onPageFinished(view, url);
              vWebViewAvatarLoading.setVisibility(View.GONE);
            }
          });
      webViewAvatar.loadUrl(avatar);
    } else {
      webViewAvatar.setVisibility(View.GONE);
      imgAvatar.setVisibility(View.VISIBLE);
      Glide.with(this)
          .load(avatar)
          .diskCacheStrategy(DiskCacheStrategy.NONE)
          .skipMemoryCache(true)
          .placeholder(imgAvatarLoadingProgress)
          .error(R.mipmap.avatar_failed)
          .centerCrop()
          .into(imgAvatar);
    }
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
        BrekekeUtils.jsCallsSize > BrekekeUtils.activitiesSize
            ? BrekekeUtils.jsCallsSize
            : BrekekeUtils.activitiesSize;
    if (!BrekekeUtils.isLocked() && n < 2) {
      btnUnlock.setVisibility(View.GONE);
    } else {
      btnUnlock.setVisibility(View.VISIBLE);
    }
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
    vWebrtcVideo = new WebRTCView(BrekekeUtils.ctx);
    vWebrtcVideo.setLayoutParams(
        new RelativeLayout.LayoutParams(
            RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.MATCH_PARENT));
    vWebrtcVideo.setObjectFit("cover");
    vWebrtc.addView(vWebrtcVideo);
    vWebrtc.setVisibility(View.VISIBLE);
  }

  public void updateDisplayVideo(boolean isVideoCall) {
    if (isVideoCall) {
      videoLoading.setVisibility(View.VISIBLE);
      vWebrtc.removeView(vWebrtcVideo);
      vWebrtcVideo = null;
    } else {
      btnSwitchCamera.setVisibility(View.GONE);
      vWebrtc.removeView(vWebrtcVideo);
      vWebrtc.setVisibility(View.GONE);
      videoLoading.setVisibility(View.GONE);
      vCardAvatarTalking.setVisibility(View.VISIBLE);
      showCallManageControls();
    }
  }

  public void setRemoteVideoStreamUrl(String url) {
    if (url == null || url.isEmpty()) {
      if (vWebrtcVideo == null) {
        return;
      }
      btnSwitchCamera.setVisibility(View.GONE);
      updateDisplayVideo(isVideoCall);
    } else {
      initWebrtcVideo();
      btnSwitchCamera.setVisibility(View.VISIBLE);
      vCardAvatarTalking.setVisibility(View.GONE);
      vWebrtcVideo.setStreamURL(url);
      if (!hasManuallyToggledCallManageControls) {
        hideCallManageControls();
      }
    }
  }

  public void onBtnSwitchCamera(View v) {
    BrekekeUtils.emit("switchCamera", uuid);
  }

  // show/hide call manage controls in video call
  public boolean hasManuallyToggledCallManageControls = false;
  public boolean isCallManageControlsHidden = false;
  public boolean isAvatarTalkingLoaded = false;

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
    updateBtnUnlockLabel();
  }

  public void hideCallManageControls() {
    isCallManageControlsHidden = true;
    vCallManageControls.setVisibility(View.GONE);
    btnUnlock.setVisibility(View.GONE);
  }

  // vIncomingCall
  public void updateLayoutManagerCall() {
    GradientDrawable shape = new GradientDrawable();
    DisplayMetrics displayMetrics = new DisplayMetrics();
    getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
    ConstraintLayout constraintLayout = findViewById(R.id.call_manager_layout);
    ConstraintSet constraintSet = new ConstraintSet();
    int height = displayMetrics.heightPixels;
    boolean isLargeDevice = height > 1200;
    int flexValue = height / 7;
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

  public void updateLayoutManagerCallLoading() {
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

  public void updateLayoutManagerCallLoaded() {
    ConstraintLayout constraintLayout = findViewById(R.id.call_manager_layout);
    ConstraintSet constraintSet = new ConstraintSet();
    constraintSet.clone(constraintLayout);
    constraintSet.clear(R.id.btn_unlock, ConstraintSet.TOP);
    if (talkingAvatar == null || talkingAvatar.isEmpty()) {
      DisplayMetrics displayMetrics = new DisplayMetrics();
      getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
      int height = displayMetrics.heightPixels;
      int flexValue = height * 1 / 3;
      constraintSet.connect(
          R.id.btn_unlock, ConstraintSet.TOP, ConstraintSet.PARENT_ID, ConstraintSet.TOP, 50);
      constraintSet.connect(
          R.id.view_call_manage_controls,
          ConstraintSet.TOP,
          ConstraintSet.PARENT_ID,
          ConstraintSet.TOP,
          flexValue);
      constraintSet.connect(
          R.id.view_button_end,
          ConstraintSet.BOTTOM,
          ConstraintSet.PARENT_ID,
          ConstraintSet.BOTTOM,
          30);
    } else {
      constraintSet.connect(
          R.id.btn_unlock,
          ConstraintSet.BOTTOM,
          R.id.view_call_manage_controls,
          ConstraintSet.TOP,
          20);
    }
    constraintSet.connect(
        R.id.view_call_manage_loading,
        ConstraintSet.BOTTOM,
        R.id.view_call_manage_controls,
        ConstraintSet.TOP,
        20);
    constraintSet.clear(R.id.view_call_manage_loading, ConstraintSet.TOP);
    constraintSet.applyTo(constraintLayout);
    if (talkingAvatar != null && !talkingAvatar.isEmpty()) {
      if (!isLarge) {
        updateLayoutManagerCall();
      }
      handleShowAvatarTalking();
    }
  }

  public void handleShowAvatarTalking() {
    destroyAvatarWebView();
    // Some case talkingAvatar update so late with auto answer case
    // It should be check and update layout
    if (!isVideoCall && answered && vCardAvatarTalking.getVisibility() == View.GONE) {
      onCallConnected();
    }
    if (BrekekeUtils.isImageUrl(talkingAvatar)) {
      webViewAvatarTalking.setVisibility(View.GONE);
      imgAvatarTalking.setVisibility(View.VISIBLE);
      Glide.with(this)
          .load(talkingAvatar)
          .diskCacheStrategy(DiskCacheStrategy.NONE)
          .skipMemoryCache(true)
          .placeholder(imgAvatarLoadingProgress)
          .error(R.mipmap.avatar_failed)
          .centerCrop()
          .into(imgAvatarTalking);
    } else {
      imgAvatarTalking.setVisibility(View.GONE);
      webViewAvatarTalking.setVisibility(View.VISIBLE);
      webViewAvatarTalking.setWebViewClient(
          new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
              super.onPageFinished(view, url);
              vWebViewAvatarTalkingLoading.setVisibility(View.GONE);
              isAvatarTalkingLoaded = true;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
              super.onPageStarted(view, url, favicon);
              vWebViewAvatarTalkingLoading.setVisibility(View.VISIBLE);
            }
          });
      if (!isAvatarTalkingLoaded) {
        webViewAvatarTalking.loadUrl(talkingAvatar);
      }
    }
  }

  private void showRequestPermissions() {
    AlertDialog.Builder builder = new AlertDialog.Builder(this);
    builder.setTitle(L.titlePermissionMicroCamera());
    builder.setMessage(L.messagePermissionMicroCamera());

    builder.setPositiveButton(
        L.close(),
        new DialogInterface.OnClickListener() {
          public void onClick(DialogInterface dialog, int id) {
            // user clicked close button
          }
        });

    builder.setNegativeButton(
        L.goToSetting(),
        new DialogInterface.OnClickListener() {
          public void onClick(DialogInterface dialog, int id) {
            Intent i =
                new Intent(
                    Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.fromParts("package", BuildConfig.APPLICATION_ID, null));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
          }
        });

    builder.create().show();
  }

  private boolean checkAndRequestPermissions() {
    if (checkSelfPermission(permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
        && checkSelfPermission(permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        && checkSelfPermission(permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED) {
      return true;
    }
    if (shouldShowRequestPermissionRationale(permission.RECORD_AUDIO)
        || shouldShowRequestPermissionRationale(permission.CAMERA)
        || shouldShowRequestPermissionRationale(permission.BLUETOOTH_CONNECT)) {
      showRequestPermissions();
      return false;
    }
    requestPermissions(
        new String[] {permission.RECORD_AUDIO, permission.CAMERA, permission.BLUETOOTH_CONNECT},
        PERMISSIONS_REQUEST_CODE);
    return false;
  }

  @Override
  public void onRequestPermissionsResult(
      int code, @NonNull String[] permissions, @NonNull int[] r) {
    super.onRequestPermissionsResult(code, permissions, r);
    int bluetooth = PackageManager.PERMISSION_GRANTED;
    // https://developer.android.com/guide/topics/connectivity/bluetooth/permissions
    if (VERSION.SDK_INT >= VERSION_CODES.S) {
      bluetooth = r[2];
    }
    switch (code) {
      case PERMISSIONS_REQUEST_CODE:
        if (r[0] == PackageManager.PERMISSION_GRANTED
            && r[1] == PackageManager.PERMISSION_GRANTED
            && bluetooth == PackageManager.PERMISSION_GRANTED) {
          handleClickAnswerCall();
        } else {
          String detail = "audio=" + r[0] + " camera=" + r[1] + " bluetooth=" + bluetooth;
          debug("PERMISSIONS_REQUEST_CODE " + detail);
        }
        break;
    }
  }

  private void handleClickAnswerCall() {
    setCallAnswered();
    vCardAvatarTalking.setVisibility(View.GONE);
    vCallManageControls.setVisibility(View.GONE);
    updateLayoutManagerCallLoading();
  }

  public void onBtnAnswerClick(View v) {
    if (answered) {
      return;
    }
    if (checkAndRequestPermissions()) {
      handleClickAnswerCall();
    }
  }

  public void onBtnRejectClick(View v) {
    BrekekeUtils.putUserActionRejectCall(uuid);
    BrekekeUtils.emit("rejectCall", "CalleeClickReject-" + uuid);
    answered = false;
    BrekekeUtils.remove(uuid);
  }

  // vCallManage
  public void onViewCallManageClick(View v) {
    if (!isVideoCall) {
      return;
    }
    hasManuallyToggledCallManageControls = true;
    toggleCallManageControls();
  }

  public void onBtnUnlockClick(View v) {
    // already invoked in onKeyguardDismissSucceeded
    updateBtnUnlockLabel();
    int n =
        BrekekeUtils.jsCallsSize > BrekekeUtils.activitiesSize
            ? BrekekeUtils.jsCallsSize
            : BrekekeUtils.activitiesSize;
    if (n > 1) {
      BrekekeUtils.emit("showBackgroundCall", uuid);
      openMainActivity();
    }
  }

  public void onBtnBackPress(View v) {
    onBackPressed();
  }

  public void onBtnTransferClick(View v) {
    BrekekeUtils.emit("transfer", uuid);
    openMainActivity();
  }

  public void onBtnParkClick(View v) {
    BrekekeUtils.emit("park", uuid);
    openMainActivity();
  }

  public void onBtnVideoClick(View v) {
    BrekekeUtils.emit("video", uuid);
    updateDisplayVideo(!isVideoCall);
    updateUILayoutManagerCall(!isVideoCall);
  }

  public void onBtnSpeakerClick(View v) {
    btnSpeaker.setSelected(!v.isSelected());
    BrekekeUtils.emit("speaker", uuid);
  }

  public void onBtnMuteClick(View v) {
    btnMute.setSelected(!v.isSelected());
    updateMuteBtnLabel();
    BrekekeUtils.emit("mute", uuid);
  }

  public void onBtnRecordClick(View v) {
    BrekekeUtils.emit("record", uuid);
  }

  public void onBtnDtmfClick(View v) {
    BrekekeUtils.emit("dtmf", uuid);
    openMainActivity();
  }

  public void onBtnHoldClick(View v) {
    BrekekeUtils.emit("hold", uuid);
  }

  public void onRequestUnlock(View v) {
    if (!BrekekeUtils.isLocked()) {
      onKeyguardDismissSucceeded(v);
      return;
    }
    BrekekeUtils.km.requestDismissKeyguard(
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
    if (v == null) {
      return;
    }
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
      case R.id.btn_back:
        onBtnBackPress(v);
        break;
      default:
        break;
    }
  }

  @Override
  public void onClick(View v) {
    switch (v.getId()) {
      case R.id.btn_back:
        onRequestUnlock(v);
        break;
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
      case R.id.btn_switch_camera:
        onBtnSwitchCamera(v);
        break;
      default:
        break;
    }
  }

  private void setCallAnswered() {
    answered = true;
    BrekekeUtils.putUserActionAnswerCall(uuid);
    BrekekeUtils.emit("answerCall", uuid);
    BrekekeUtils.staticStopRingtone();
    vIncomingCall.setVisibility(View.GONE);
    vHeaderIncomingCall.setVisibility(View.GONE);
    vCallManage.setVisibility(View.VISIBLE);
    vNavHeader.setVisibility(View.VISIBLE);
  }

  public void onCallConnected() {
    if (!answered) {
      setCallAnswered();
      // only update if answer==true
      return;
    }

    long answeredAt = System.currentTimeMillis();
    startTimer(answeredAt);
    vCallManageLoading.setVisibility(View.GONE);
    if (talkingAvatar == null || talkingAvatar.isEmpty()) {
      vCardAvatarTalking.setVisibility(View.GONE);
    } else {
      vCardAvatarTalking.setVisibility(View.VISIBLE);
    }
    vCallManageControls.setVisibility(View.VISIBLE);
    updateLayoutManagerCallLoaded();
  }

  public void disableAvatarTalking() {
    vCardAvatarTalking.setVisibility(View.GONE);
    // update position to top for btn Unlock
    ConstraintLayout constraintLayout = findViewById(R.id.call_manager_layout);
    ConstraintSet constraintSet = new ConstraintSet();
    constraintSet.clone(constraintLayout);
    constraintSet.clear(R.id.btn_unlock, ConstraintSet.TOP);
    constraintSet.connect(
        R.id.btn_unlock, ConstraintSet.TOP, ConstraintSet.PARENT_ID, ConstraintSet.TOP, 50);
    constraintSet.applyTo(constraintLayout);
  }

  public void enableAvatarTalking() {
    // update position to bottom for btn Unlock
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
    constraintSet.applyTo(constraintLayout);

    vCardAvatarTalking.setVisibility(View.VISIBLE);
    // load image content
    handleShowAvatarTalking();
  }

  public void updateUILayoutManagerCall(boolean isVideoCall) {
    if (isVideoCall || talkingAvatar == null || talkingAvatar.isEmpty()) {
      disableAvatarTalking();
    } else {
      enableAvatarTalking();
    }
  }

  public void setBtnVideoSelected(boolean _isVideoCall) {
    if (isVideoCall != _isVideoCall) {
      isVideoCall = _isVideoCall;
      btnVideo.setSelected(_isVideoCall);
    }
  }

  public void setBtnHoldSelected(boolean holding) {
    btnHold.setSelected(holding);
    updateBtnHoldLabel();
    btnEndCall.setVisibility(holding ? View.GONE : View.VISIBLE);
    txtCallIsOnHold.setVisibility(holding ? View.VISIBLE : View.GONE);
  }

  public void setBtnMuteSelected(boolean isMute) {
    btnMute.setSelected(isMute);
    updateMuteBtnLabel();
  }

  public void setBtnSpeakerSelected(boolean isSpeakerOn) {
    btnSpeaker.setSelected(isSpeakerOn);
  }

  public void setBtnSwitchCamera(boolean isFrontCamera) {
    btnSwitchCamera.setSelected(isFrontCamera);
  }

  public void setImageTalkingUrl(String url, boolean _isLarge) {
    talkingAvatar = url;
    isLarge = _isLarge;
    handleShowAvatarTalking();
  }

  public void setRecordingStatus(boolean isRecording) {
    debug("setRecordingStatus: " + isRecording);
    btnRecord.setSelected(isRecording);
  }

  public void forceFinish() {
    destroyed = true;
    try {
      finish();
    } catch (Exception e) {
      debug("forceFinish catch: " + e.getLocalizedMessage());
    }
  }

  public void finishRemoveTask() {
    destroyed = true;
    try {
      finishAndRemoveTask();
    } catch (Exception e) {
      debug("finishRemoveTask catch: " + e.getLocalizedMessage());
    }
  }

  public void reorderToFront() {
    Intent i = new Intent(this, IncomingCallActivity.class);
    i.setFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
    startActivity(i);
    updateBtnUnlockLabel();
  }

  // ==========================================================================
  // stop ringtone on any press and custom back btn handler
  @Override
  public boolean dispatchKeyEvent(KeyEvent e) {
    int k = e.getKeyCode();
    int a = e.getAction();
    BrekekeUtils.emit("debug", "IncomingCallActivity.onKeyDown k=" + k + " a=" + a);
    // stop ringtone if any of the hardware key press
    BrekekeUtils.staticStopRingtone();
    // handle back btn press, remember that this event fire twice, down/up
    if (k == KeyEvent.KEYCODE_BACK || k == KeyEvent.KEYCODE_SOFT_LEFT) {
      if (a == KeyEvent.ACTION_DOWN) {
        if (BrekekeUtils.isLocked()) {
          onRequestUnlock(null);
        } else {
          onBackPressed();
        }
      }
      return true;
    }
    return super.dispatchKeyEvent(e);
  }

  // ==========================================================================
  // timer to count talking time
  public Timer timer;
  public TimerTask timerTask;

  public void startTimer(long answeredAt) {
    // make sure timer task execute one time
    if (timerTask != null) {
      return;
    }
    timerTask =
        new TimerTask() {
          @Override
          public void run() {
            runOnUiThread(
                new Runnable() {
                  @Override
                  public void run() {
                    long now = System.currentTimeMillis();
                    long ms = now - answeredAt;
                    txtDurationCall.setText(getTimerText(ms));
                  }
                });
          }
        };
    timer.scheduleAtFixedRate(timerTask, 0, 1000);
  }

  public String getTimerText(long ms) {
    long os = 1000;
    long om = 60 * os;
    long oh = 60 * om;
    double h = Math.floor(ms / oh);
    ms = ms % oh;
    double m = Math.floor(ms / om);
    ms = ms % om;
    double s = Math.floor(ms / os);
    return h != 0
        ? (String.format("%02d", (int) h) + ":")
        : "" + String.format("%02d", (int) m) + ":" + String.format("%02d", (int) s);
  }

  // ==========================================================================
  // private utils
  public void debug(String message) {
    BrekekeUtils.emit("debug", "IncomingCallActivity " + callerName + " " + message);
  }
}
