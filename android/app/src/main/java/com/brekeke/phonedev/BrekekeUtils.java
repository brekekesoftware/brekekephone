package com.brekeke.phonedev;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.AudioDeviceInfo;
import android.media.AudioManager;
import android.media.AudioManager.OnCommunicationDeviceChangedListener;
import android.media.AudioManager.OnModeChangedListener;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Handler;
import android.os.PowerManager;
import android.os.PowerManager.WakeLock;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.CallLog;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import com.google.firebase.messaging.RemoteMessage;
import com.reactnativecommunity.asyncstorage.AsyncLocalStorageUtil;
import com.reactnativecommunity.asyncstorage.ReactDatabaseSupplier;
import io.wazo.callkeep.RNCallKeepModule;
import io.wazo.callkeep.VoiceConnectionService;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.json.JSONArray;
import org.json.JSONObject;

public class BrekekeUtils extends ReactContextBaseJavaModule {
  public static RCTDeviceEventEmitter eventEmitter;

  public static WritableMap parseParams(RemoteMessage message) {
    WritableMap params = Arguments.createMap();
    params.putString("from", message.getFrom());
    params.putString("google.message_id", message.getMessageId());
    params.putDouble("google.sent_time", message.getSentTime());
    if (message.getData() != null) {
      Map<String, String> data = message.getData();
      Set<String> keysIterator = data.keySet();
      for (String key : keysIterator) {
        params.putString(key, data.get(key));
      }
    }
    return params;
  }

  public static void emit(String name, String data) {
    try {
      eventEmitter.emit(name, data);
    } catch (Exception e) {
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

  BrekekeUtils(ReactApplicationContext c) {
    super(c);
    ctx = c;
    initStaticServices(c);
    debugAudioListener();
  }

  private void debugAudioListener() {
    if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.S) {
      return;
    }
    OnModeChangedListener l1 =
        new OnModeChangedListener() {
          @Override
          public void onModeChanged(int mode) {
            switch (mode) {
              case AudioManager.MODE_NORMAL:
                emit("debug", "onModeChanged:mode::AudioManager.MODE_NORMAL");
                break;
              case AudioManager.MODE_INVALID:
                emit("debug", "onModeChanged:mode::AudioManager.MODE_INVALID");
                break;
              case AudioManager.MODE_CURRENT:
                emit("debug", "onModeChanged:mode::AudioManager.MODE_CURRENT");
                break;
              case AudioManager.MODE_RINGTONE:
                emit("debug", "onModeChanged:mode::AudioManager.MODE_RINGTONE");
                break;
              case AudioManager.MODE_IN_CALL:
                emit("debug", "onModeChanged:mode::AudioManager.MODE_IN_CALL");
                break;
              case AudioManager.MODE_IN_COMMUNICATION:
                emit("debug", "onModeChanged:mode::AudioManager.MODE_IN_COMMUNICATION");
                break;
              case AudioManager.MODE_CALL_SCREENING:
                emit("debug", "onModeChanged:mode::AudioManager.MODE_CALL_SCREENING");
                break;
              default:
                emit("debug", "onModeChanged:mode::" + mode);
                break;
            }
          }
        };
    OnCommunicationDeviceChangedListener l2 =
        new OnCommunicationDeviceChangedListener() {
          @Override
          public void onCommunicationDeviceChanged(AudioDeviceInfo device) {
            emit(
                "debug",
                "onCommunicationDeviceChanged:AudioDeviceInfo::"
                    + device.getType()
                    + "::"
                    + device.getProductName());
          }
        };
    am.addOnModeChangedListener(ctx.getMainExecutor(), l1);
    am.addOnCommunicationDeviceChangedListener(ctx.getMainExecutor(), l2);
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
    // https://dev01.brekeke.com:8443/uc/image?ACTION=DOWNLOAD&tenant=nam&user=1003&dlk=ltt3&SIZE=40
    if (url.toLowerCase().contains("/uc/image?action=download&tenant")) {
      return true;
    }
    try {
      URL aURL = new URL(url.toLowerCase());
      Pattern p = Pattern.compile(".(jpeg|jpg|gif|png)$");
      Matcher m = p.matcher(aURL.getPath());
      return m.find();
    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }

  // interval for the case js set rejectCall even before activity start/starting
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

          // check in 60s
          private int elapsed = 0;
        },
        1000);
  }

  public static void onFcmMessageReceived(Context c, Map<String, String> data) {
    //
    // check if it is a PN for incoming call
    if (data.get("x_pn-id") == null) {
      return;
    }
    //
    // init services if not
    initStaticServices(c);
    acquireWakeLock();
    //
    // generate new uuid and store it to the PN bundle
    String now = new SimpleDateFormat("HH:mm:ss.SSS", Locale.getDefault()).format(new Date());
    data.put("callkeepAt", now);
    String uuid = UUID.randomUUID().toString().toUpperCase();
    data.put("callkeepUuid", uuid);
    //
    // check if the account exist and load the locale
    Context appCtx = c.getApplicationContext();
    if (!checkAccountExist(appCtx, data)) {
      return;
    }
    prepareLocale(appCtx);
    //
    // show call
    String displayName = data.get("x_displayname");
    if (displayName == null || displayName.isEmpty()) {
      displayName = data.get("x_from");
    }
    if (displayName == null || displayName.isEmpty()) {
      displayName = "Loading...";
    }
    String callerName = displayName; // redeclare as final to put in nested class
    String avatar = data.get("x_image");
    String avatarSize = data.get("x_image_size");
    RNCallKeepModule.registerPhoneAccount(appCtx);
    Runnable onShowIncomingCallUi =
        new Runnable() {
          @Override
          public void run() {
            String a = userActions.get(uuid);
            if (a != null) {
              if ("rejectCall".equals(a)) {
                RNCallKeepModule.staticEndCall(uuid, appCtx);
              }
              return;
            }
            userActions.put(uuid, "display");
            activitiesSize++;
            if (activitiesSize == 1) {
              firstShowCallAppActive = isAppActive || isAppActiveLocked;
            }
            Intent i = new Intent(c, IncomingCallActivity.class);
            i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_MULTIPLE_TASK);
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
    // try to run onShowIncomingCallUi if there is already an ongoing call
    if (VoiceConnectionService.currentConnections.size() > 0
        || RNCallKeepModule.onShowIncomingCallUiCallbacks.size() > 0
        || activitiesSize > 0) {
      onShowIncomingCallUi.run();
    }
    RNCallKeepModule.onShowIncomingCallUiCallbacks.put(uuid, onShowIncomingCallUi);
    RNCallKeepModule.onRejectCallbacks.put(uuid, onReject);
    RNCallKeepModule.staticDisplayIncomingCall(uuid, "Brekeke Phone", callerName, false);
  }

  private static void prepareLocale(Context appCtx) {
    if (L.l == null) {
      try {
        L.l =
            AsyncLocalStorageUtil.getItemImpl(
                ReactDatabaseSupplier.getInstance(appCtx).getReadableDatabase(), "locale");
      } catch (Exception e) {
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
      if (pbxUsername == null || pbxUsername.isEmpty()) {
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
        // same logic compareAccount in js code authStore
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

  // when an incoming GSM call is ringing
  //    if another incoming Brekeke Phone call comes
  //    it will be automatically rejected by the system
  // we will manually fire the rejectCall event here
  // there may be duplicated events in some cases, need to test more
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
    if (!activities.isEmpty() || jsCallsSize > activitiesSize) {
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

  //
  // manage all IncomingCallActivity
  public static ArrayList<IncomingCallActivity> activities = new ArrayList<IncomingCallActivity>();
  // manually manage activities size:
  // try to increase BEFORE contructing the intent, the above activities is add AFTER constructing
  public static int activitiesSize = 0;
  // calls size from js, this may be different with
  // activitiesSize in some cases: out going call...
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
    try {
      a.forceFinish();
    } catch (Exception e) {
    }
  }

  public static void removeAll() {
    emit("debug", "removeAll");
    staticStopRingtone();
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

  public static void staticCloseIncomingCall(String uuid) {
    emit("debug", "staticCloseIncomingCall");
    try {
      at(uuid).answered = false;
    } catch (Exception e) {
    }
    putUserActionRejectCall(uuid);
    remove(uuid);
  }

  private static IncomingCallActivity at(String uuid) {
    try {
      for (IncomingCallActivity a : activities) {
        if (a.uuid.equals(uuid)) {
          return a;
        }
      }
    } catch (Exception e) {
    }
    return null;
  }

  private static int index(String uuid) {
    try {
      int i = 0;
      for (IncomingCallActivity a : activities) {
        if (a.uuid.equals(uuid)) {
          return i;
        }
        i++;
      }
    } catch (Exception e) {
    }
    return -1;
  }

  private static boolean activitesAnyAnswered() {
    try {
      for (IncomingCallActivity a : activities) {
        if (a.answered) {
          return true;
        }
      }
    } catch (Exception e) {
    }
    return false;
  }

  private static boolean activitesAllDestroyed() {
    try {
      for (IncomingCallActivity a : activities) {
        if (!a.destroyed) {
          return false;
        }
      }
    } catch (Exception e) {
    }
    return true;
  }

  public static void onActivityDestroy(String uuid) {
    activitiesSize--;
    updateBtnUnlockLabels();
    try {
      destroyedUuids.put(uuid, "destroyed");
    } catch (Exception e) {
    }
    if (activitiesSize == 0 || activitesAnyAnswered() || activitesAllDestroyed()) {
      staticStopRingtone();
    }
    if (activitiesSize == 0 && jsCallsSize == 0) {
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
  // move start/stop ringtone here
  //
  public static MediaPlayer mp;

  public static void staticStartRingtone() {
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

  public static void staticStopRingtone() {
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

  public static boolean checkNotificationPermission(Context ctx) {
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
      return ContextCompat.checkSelfPermission(ctx, android.Manifest.permission.POST_NOTIFICATIONS)
          == PackageManager.PERMISSION_GRANTED;
    }
    return NotificationManagerCompat.from(ctx).areNotificationsEnabled();
  }

  // ==========================================================================
  // react methods

  @ReactMethod
  public void insertCallLog(String number, int type) {
    ContentValues values = new ContentValues();
    values.put(CallLog.Calls.NUMBER, number);
    values.put(CallLog.Calls.DATE, System.currentTimeMillis());
    values.put(CallLog.Calls.TYPE, type);
    values.put(CallLog.Calls.CACHED_NAME, "Brekeke Phone");
    ctx.getContentResolver().insert(CallLog.Calls.CONTENT_URI, values);
  }

  @ReactMethod
  public void getInitialNotifications(Promise promise) {
    BrekekeMessagingService.getInitialNotifications(promise);
  }

  @ReactMethod
  public void isLocked(Promise p) {
    p.resolve(isLocked());
  }

  @ReactMethod
  public void startRingtone() {
    staticStartRingtone();
  }

  @ReactMethod
  public void stopRingtone() {
    staticStopRingtone();
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
  public void setPbxConfig(String jsonStr) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              if (!jsonStr.startsWith("{")) {
                return;
              }
              JSONObject o = new JSONObject(jsonStr);
              for (IncomingCallActivity a : activities) {
                try {
                  a.pbxConfig = o;
                  a.updateCallConfig();
                } catch (Exception e) {
                }
              }
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setCallConfig(String uuid, String jsonStr) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              if (!jsonStr.startsWith("{")) {
                return;
              }
              IncomingCallActivity a = at(uuid);
              a.callConfig = new JSONObject(jsonStr);
              a.updateCallConfig();
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setIsAppActive(boolean b1, boolean b2) {
    isAppActive = b1;
    isAppActiveLocked = b2;
  }

  @ReactMethod
  public void setTalkingAvatar(String uuid, String url, boolean isLarge) {
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
    } else if (activitiesSize == 0) {
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
  public void setRecordingStatus(String uuid, boolean isRecording) {
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
  public void setRemoteVideoStreamUrl(String uuid, String url, String localUrl) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setRemoteVideoStreamUrl(url, localUrl);
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
  public void setIsMute(String uuid, boolean isMute) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setBtnMuteSelected(isMute);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setSpeakerStatus(Boolean isSpeakerOn) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              for (IncomingCallActivity a : activities) {
                try {
                  a.setBtnSpeakerSelected(isSpeakerOn);
                } catch (Exception e) {
                }
              }
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
                a.reorderToFront();
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
