package com.brekeke.phonedev;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Handler;
import android.os.PowerManager;
import android.os.PowerManager.WakeLock;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import com.reactnativecommunity.asyncstorage.AsyncLocalStorageUtil;
import com.reactnativecommunity.asyncstorage.ReactDatabaseSupplier;
import io.wazo.callkeep.RNCallKeepModule;
import io.wazo.callkeep.VoiceConnectionService;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.json.JSONArray;
import org.json.JSONObject;

public class BrekekeUtils extends ReactContextBaseJavaModule {

  public class Config {
    public boolean hideBtnTransfer;
    public boolean hideBtnPark;
    public boolean hideBtnVideo;
    public boolean hideBtnSpeaker;
    public boolean hideBtnMute;
    public boolean hideBtnRecord;
    public boolean hideBtnDTMF;
    public boolean hideBtnHold;
    public boolean hideBtnReject;

    public Config() {
      this.hideBtnTransfer = false;
      this.hideBtnPark = false;
      this.hideBtnVideo = false;
      this.hideBtnSpeaker = false;
      this.hideBtnMute = false;
      this.hideBtnRecord = false;
      this.hideBtnDTMF = false;
      this.hideBtnHold = false;
      this.hideBtnReject = false;
    }
  }

  public static RCTDeviceEventEmitter eventEmitter;

  public static void emit(String name, String data) {
    try {
      eventEmitter.emit(name, data);
    } catch (Exception ex) {
    }
  }

  public static WakeLock wl;

  public static void acquireWakeLock() {
    if (!wl.isHeld()) {
      emit("debug", "calling wl.acquire()");
      wl.acquire();
    }
  }

  public static void releaseWakeLock() {
    if (wl.isHeld()) {
      emit("debug", "calling wl.release()");
      wl.release();
    }
  }

  public static Activity main;
  public static ReactApplicationContext ctx;
  public static KeyguardManager km;
  public static AudioManager am;
  public static Vibrator vib;

  public static boolean isAppActive = false;
  public static boolean isAppActiveLocked = false;
  public static boolean firstShowCallAppActive = false;
  public static Config config;

  BrekekeUtils(ReactApplicationContext c) {
    super(c);
    ctx = c;
    initStaticServices(c);
    config = new Config();
  }

  @Override
  public void initialize() {
    super.initialize();
    eventEmitter = ctx.getJSModule(RCTDeviceEventEmitter.class);
  }

  @Override
  public String getName() {
    return "BrekekeUtils";
  }

  // [callkeepUuid] -> display/answerCall/rejectCall
  public static Map<String, String> userActions = new HashMap<String, String>();
  public static Context fcm;

  public static void initStaticServices(Context c) {
    if (wl == null) {
      PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
      wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "BrekekePhone::BrekekeUtils");
    }
    if (km == null) {
      km = (KeyguardManager) c.getSystemService(Context.KEYGUARD_SERVICE);
    }
    if (am == null) {
      am = (AudioManager) c.getSystemService(Context.AUDIO_SERVICE);
    }
    if (ctx == null) {
      fcm = c;
    }
  }

  public static void putUserActionRejectCall(String uuid) {
    try {
      userActions.put(uuid, "rejectCall");
    } catch (Exception e) {
    }
  }

  public static void putUserActionAnswerCall(String uuid) {
    try {
      userActions.put(uuid, "answerCall");
    } catch (Exception e) {
    }
  }

  public static boolean isImageUrl(String url) {
    // fix for exception get image from UC:
    // https://apps.brekeke.com:8443/uc/image?ACTION=DOWNLOAD&tenant=nam&user=1003&dlk=ltt3&SIZE=40
    if (url.toLowerCase().contains("/uc/image?ACTION=DOWNLOAD&tenant".toLowerCase())) {
      return true;
    }
    try {
      URL aURL = new URL(url.toLowerCase());
      Pattern p = Pattern.compile(".(jpeg|jpg|gif|png)$");
      Matcher m = p.matcher(aURL.getPath());
      return m.find();
    } catch (MalformedURLException e) {
      e.printStackTrace();
      return false;
    }
  }

  // Interval for the case js set rejectCall even before activity start/starting
  public static Map<String, String> destroyedUuids = new HashMap<String, String>();

  public static void intervalCheckRejectCall(String uuid) {
    Handler h = new Handler();
    h.postDelayed(
        new Runnable() {
          @Override
          public void run() {
            if ("rejectCall".equals(userActions.get(uuid))) {
              remove(uuid);
            }
            if (destroyedUuids.containsKey(uuid) || elapsed >= 60000) {
              return;
            }
            elapsed += 1000;
            h.postDelayed(this, 1000);
          }
          // Check in 60s
          private int elapsed = 0;
        },
        1000);
  }

  public static void onFcmMessageReceived(Context c, Map<String, String> data) {
    //
    // Check if it is a PN for incoming call
    if (data.get("x_pn-id") == null) {
      return;
    }
    //
    // Init services if not
    initStaticServices(c);
    acquireWakeLock();
    //
    // Generate new uuid and store it to the PN bundle
    String now = new SimpleDateFormat("HH:mm:ss.SSS", Locale.getDefault()).format(new Date());
    data.put("callkeepAt", now);
    String uuid = UUID.randomUUID().toString().toUpperCase();
    data.put("callkeepUuid", uuid);
    //
    // Check if the account exist and load the locale
    Context appCtx = c.getApplicationContext();
    if (!checkAccountExist(appCtx, data)) {
      return;
    }
    prepareLocale(appCtx);
    //
    // Show call
    String displayName = data.get("x_displayname");
    String avatar = data.get("x_image");
    String avatarSize = data.get("x_image_size");
    if (displayName == null || "".equals(displayName)) {
      displayName = data.get("x_from");
    }
    if (displayName == null || "".equals(displayName)) {
      displayName = "Loading...";
    }
    String callerName = displayName;
    RNCallKeepModule.registerPhoneAccount(appCtx);
    Runnable onShowIncomingCallUi =
        new Runnable() {
          @Override
          public void run() {
            String a = userActions.get(uuid);
            if (a != null) {
              if ("rejectCall".equals(a)) {
                RNCallKeepModule.staticEndCall(uuid);
              }
              return;
            }
            userActions.put(uuid, "display");
            activitiesSize++;
            if (last() == null) {
              firstShowCallAppActive = isAppActive || isAppActiveLocked;
            }
            Intent i = new Intent(c, IncomingCallActivity.class);
            i.setFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
                    | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
                    | Intent.FLAG_ACTIVITY_MULTIPLE_TASK);
            i.putExtra("uuid", uuid);
            i.putExtra("callerName", callerName);
            i.putExtra("avatar", avatar);
            i.putExtra("avatarSize", avatarSize);
            c.startActivity(i);
          }
        };
    Runnable onReject =
        new Runnable() {
          @Override
          public void run() {
            onPassiveReject(uuid);
          }
        };
    //
    // Try to run onShowIncomingCallUi if there is already an ongoing call
    if (VoiceConnectionService.currentConnections.size() > 0
        || RNCallKeepModule.onShowIncomingCallUiCallbacks.size() > 0
        || activitiesSize > 0) {
      onShowIncomingCallUi.run();
    }
    RNCallKeepModule.onShowIncomingCallUiCallbacks.put(uuid, onShowIncomingCallUi);
    RNCallKeepModule.onRejectCallbacks.put(uuid, onReject);
    RNCallKeepModule.staticDisplayIncomingCall(uuid, "number", "caller");
  }

  private static void prepareLocale(Context appCtx) {
    if (L.l == null) {
      try {
        L.l =
            AsyncLocalStorageUtil.getItemImpl(
                ReactDatabaseSupplier.getInstance(appCtx).getReadableDatabase(), "locale");
      } catch (Exception ex) {
      }
    }
    if (L.l == null) {
      L.l = "en";
    }
    if (!"en".equals(L.l) && !"ja".equals(L.l)) {
      L.l = "en";
    }
  }

  private static boolean checkAccountExist(Context appCtx, Map<String, String> data) {
    try {
      String pbxUsername = data.get("x_to");
      if (pbxUsername == null || "".equals(pbxUsername)) {
        return false;
      }
      String pbxHostname = data.get("x_host");
      String pbxTenant = data.get("x_tenant");
      String jsonStr =
          AsyncLocalStorageUtil.getItemImpl(
              ReactDatabaseSupplier.getInstance(appCtx).getReadableDatabase(), "_api_profiles");
      JSONArray accounts = (new JSONObject(jsonStr)).getJSONArray("profiles");
      for (int i = 0; i < accounts.length(); i++) {
        JSONObject a = accounts.getJSONObject(i);
        // Same logic compareAccount in js code authStore
        if (pbxUsername.equals(a.getString("pbxUsername"))
            && (pbxHostname == null || pbxHostname.equals(a.getString("pbxHostname")))
            && (pbxTenant == null || pbxTenant.equals(a.getString("pbxTenant")))) {
          return true;
        }
      }
    } catch (Exception e) {
    }
    return false;
  }

  // When an incoming GSM call is ringing, if another incoming Brekeke Phone call comes
  //    the Brekeke Phone call it will be automatically rejected by the system
  // We will fire the event manually here
  // There may be duplicated events in some cases, need to test more
  public static void onPassiveReject(String uuid) {
    emit("debug", "onPassiveReject uuid=" + uuid);
    emit("rejectCall", uuid);
    staticCloseIncomingCall(uuid);
  }

  public static void removeCallKeepCallbacks(String uuid) {
    try {
      RNCallKeepModule.onShowIncomingCallUiCallbacks.remove(uuid);
    } catch (Exception e) {
    }
    try {
      RNCallKeepModule.onRejectCallbacks.remove(uuid);
    } catch (Exception e) {
    }
  }

  public static void tryExitClearTask() {
    if (!activities.isEmpty()) {
      return;
    }
    if (!firstShowCallAppActive) {
      try {
        main.moveTaskToBack(true);
      } catch (Exception e) {
      }
    }
    if (main == null) {
      Intent i = new Intent(ctx, ExitActivity.class);
      i.addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK
              | Intent.FLAG_ACTIVITY_CLEAR_TASK
              | Intent.FLAG_ACTIVITY_NO_ANIMATION
              | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
      ctx.startActivity(i);
    }
  }

  public static boolean isLocked() {
    return km.isKeyguardLocked() || km.isDeviceLocked();
  }

  public static boolean isSilent() {
    int mode = am.getRingerMode();
    return mode == AudioManager.RINGER_MODE_SILENT || mode == AudioManager.RINGER_MODE_VIBRATE;
  }

  //
  // IncomingCallActivityManager
  //
  public static ArrayList<IncomingCallActivity> activities = new ArrayList<IncomingCallActivity>();
  // Manually manage activities size:
  // Try to increase BEFORE contructing the intent, the above activities is add AFTER constructing
  public static int activitiesSize = 0;
  // Calls size from js, this may be different with activitiesSize in some cases: out going call...
  public static int jsCallsSize = 0;

  public static void remove(String uuid) {
    removeCallKeepCallbacks(uuid);
    IncomingCallActivity a = at(uuid);
    emit("debug", "remove a==null " + (a == null));
    if (a == null) {
      return;
    }
    try {
      activities.remove(index(uuid));
    } catch (Exception e) {
    }
    if (activitiesSize == 1 && !a.answered) {
      tryExitClearTask();
    }
    a.forceFinish();
  }

  public static void removeAll() {
    emit("debug", "removeAll");
    stopRingtone();
    if (activities.size() <= 0) {
      return;
    }
    boolean atLeastOneAnswerPressed = false;
    try {
      for (IncomingCallActivity a : activities) {
        atLeastOneAnswerPressed = atLeastOneAnswerPressed || a.answered;
        a.forceFinish();
        removeCallKeepCallbacks(a.uuid);
      }
      activities.clear();
    } catch (Exception e) {
    }
    if (!atLeastOneAnswerPressed) {
      tryExitClearTask();
    }
  }

  public static void removeAllAndBackToForeground() {
    emit("debug", "removeAllAndBackToForeground");
    removeAll();
    emit("backToForeground", "");
  }

  public static void staticCloseIncomingCall(String uuid) {
    emit("debug", "staticCloseIncomingCall");
    try {
      at(uuid).answered = false;
    } catch (Exception e) {
    }
    putUserActionRejectCall(uuid);
    remove(uuid);
  }

  public static IncomingCallActivity at(String uuid) {
    try {
      for (IncomingCallActivity a : activities) {
        if (a.uuid.equals(uuid)) {
          return a;
        }
      }
      return null;
    } catch (Exception e) {
      return null;
    }
  }

  public static IncomingCallActivity last() {
    try {
      return activities.get(activities.size() - 1);
    } catch (Exception e) {
      return null;
    }
  }

  public static int index(String uuid) {
    int i = 0;
    for (IncomingCallActivity a : activities) {
      if (a.uuid.equals(uuid)) {
        return i;
      }
      i++;
    }
    return -1;
  }

  public static void onActivityPauseOrDestroy(String uuid, boolean destroyed) {
    emit("debug", "onActivityPauseOrDestroy activites.size()=" + activities.size());
    if (destroyed) {
      activitiesSize--;
      updateBtnUnlockLabels();
      try {
        destroyedUuids.put(uuid, "destroyed");
      } catch (Exception e) {
      }
      IncomingCallActivity l = last();
      if (l == null || l.answered) {
        stopRingtone();
      }
    }
    if (activitiesSize > 0) {
      return;
    }
    if (jsCallsSize == 0) {
      releaseWakeLock();
    }
  }

  public static void updateBtnUnlockLabels() {
    try {
      for (IncomingCallActivity a : activities) {
        try {
          a.updateBtnUnlockLabel();
        } catch (Exception e) {
        }
      }
    } catch (Exception e) {
    }
  }

  //
  // Move start/stop ringtone here
  //
  public static MediaPlayer mp;

  public static void startRingtone() {
    if (mp != null) {
      return;
    }
    Context c = ctx != null ? ctx : fcm;
    int mode = am.getRingerMode();
    if (mode == AudioManager.RINGER_MODE_SILENT) {
      return;
    }
    if (vib == null) {
      vib = (Vibrator) c.getSystemService(Context.VIBRATOR_SERVICE);
    }
    long[] pattern = {0, 1000, 1000};
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      vib.vibrate(VibrationEffect.createWaveform(pattern, new int[] {0, 255, 0}, 0));
    } else {
      vib.vibrate(pattern, 0);
    }
    if (mode == AudioManager.RINGER_MODE_VIBRATE) {
      return;
    }
    am.setMode(AudioManager.MODE_RINGTONE);
    mp =
        MediaPlayer.create(
            c,
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

  public static void stopRingtone() {
    try {
      vib.cancel();
      vib = null;
    } catch (Exception e) {
      vib = null;
    }
    try {
      mp.stop();
      mp.release();
      mp = null;
    } catch (Exception e) {
      mp = null;
    }
  }

  // ==========================================================================
  // React methods

  @ReactMethod
  public void getInitialNotifications(Promise promise) {
    BrekekeMessagingService.getInitialNotifications(promise);
  }

  @ReactMethod
  public void isLocked(Promise p) {
    p.resolve(isLocked());
  }

  @ReactMethod
  public void isSilent(Promise p) {
    p.resolve(isSilent());
  }

  @ReactMethod
  public void backToBackground() {
    try {
      main.moveTaskToBack(true);
    } catch (Exception e) {
    }
  }

  @ReactMethod
  public void getIncomingCallPendingUserAction(String uuid, Promise p) {
    p.resolve(userActions.get(uuid));
  }

  @ReactMethod
  public void closeIncomingCall(String uuid) {
    emit("debug", "closeIncomingCall uuid=" + uuid);
    staticCloseIncomingCall(uuid);
  }

  @ReactMethod
  public void closeAllIncomingCalls() {
    emit("debug", "closeAllIncomingCalls");
    removeAll();
  }

  @ReactMethod
  public void setConfig(
      Boolean hideBtnTransfer,
      Boolean hideBtnPark,
      Boolean hideBtnVideo,
      Boolean hideBtnSpeaker,
      Boolean hideBtnMute,
      Boolean hideBtnRecord,
      Boolean hideBtnDTMF,
      Boolean hideBtnHold,
      Boolean hideBtnReject) {
    this.config.hideBtnTransfer = hideBtnTransfer;
    this.config.hideBtnPark = hideBtnPark;
    this.config.hideBtnVideo = hideBtnVideo;
    this.config.hideBtnSpeaker = hideBtnSpeaker;
    this.config.hideBtnMute = hideBtnMute;
    this.config.hideBtnRecord = hideBtnRecord;
    this.config.hideBtnDTMF = hideBtnDTMF;
    this.config.hideBtnHold = hideBtnHold;
    this.config.hideBtnReject = hideBtnReject;
    // update UI with case IncomingCallActivity start before user login finish
    try {
      for (IncomingCallActivity a : activities) {
        try {
          a.updateConfig();
        } catch (Exception e) {
        }
      }
    } catch (Exception e) {
    }
  }

  @ReactMethod
  public void setIsAppActive(boolean b1, boolean b2) {
    isAppActive = b1;
    isAppActiveLocked = b2;
  }

  @ReactMethod
  public void setTalkingAvatar(String uuid, String url, Boolean isLarge) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setImageTalkingUrl(url, isLarge);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setJsCallsSize(int n) {
    if (n > 0) {
      acquireWakeLock();
    } else {
      releaseWakeLock();
    }
    jsCallsSize = n;
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            updateBtnUnlockLabels();
          }
        });
  }

  @ReactMethod
  public void setRecordingStatus(String uuid, Boolean isRecording) {
    emit("debug", "setRecordingStatus uuid=" + uuid + " isRecording=" + isRecording);
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setRecordingStatus(isRecording);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setIsVideoCall(String uuid, boolean isVideoCall) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setBtnVideoSelected(isVideoCall);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setRemoteVideoStreamURL(String uuid, String url) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setRemoteVideoStreamURL(url);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setIsFrontCamera(String uuid, boolean isFrontCamera) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setBtnSwitchCamera(isFrontCamera);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setOnHold(String uuid, boolean holding) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setBtnHoldSelected(holding);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setLocale(String locale) {
    L.l = locale;
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              for (IncomingCallActivity a : activities) {
                try {
                  a.updateLabels();
                } catch (Exception e) {
                }
              }
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void onCallConnected(String uuid) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).onCallConnected();
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void onCallKeepAction(String uuid, String action) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              if ("answerCall".equals(action)) {
                IncomingCallActivity a = at(uuid);
                a.onBtnAnswerClick(null);
                if (isLocked()) {
                  a.reorderToFront();
                }
              } else if ("rejectCall".equals(action)) {
                at(uuid).onBtnRejectClick(null);
              }
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void onPageCallManage(String uuid) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            IncomingCallActivity toFront = at(uuid);
            emit("debug", "onPageCallManage uuid=" + uuid + " toFront==null " + (toFront == null));
            if (toFront != null) {
              toFront.reorderToFront();
            }
          }
        });
  }

  @ReactMethod
  public void hasIncomingCallActivity(String uuid, Promise p) {
    try {
      p.resolve(at(uuid) != null);
    } catch (Exception e) {
      p.resolve(false);
    }
  }

  @ReactMethod
  public void systemUptimeMs(Promise p) {
    try {
      p.resolve((double) SystemClock.elapsedRealtime());
    } catch (Exception e) {
      p.resolve(-1d);
    }
  }
}
