package com.brekeke.phonedev;

import static android.content.Context.TELECOM_SERVICE;
import static androidx.core.content.ContextCompat.checkSelfPermission;

import android.Manifest.permission;
import android.app.Activity;
import android.app.KeyguardManager;
import android.app.role.RoleManager;
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
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.PowerManager;
import android.os.PowerManager.WakeLock;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.CallLog;
import android.provider.Settings;
import android.telecom.TelecomManager;
import android.util.Log;
import androidx.activity.result.ActivityResultLauncher;
import androidx.core.app.NotificationManagerCompat;
import com.brekeke.phonedev.activity.ExitActivity;
import com.brekeke.phonedev.activity.IncomingCallActivity;
import com.brekeke.phonedev.lpc.BrekekeLpcService;
import com.brekeke.phonedev.lpc.LpcUtils;
import com.brekeke.phonedev.push_notification.BrekekeMessagingService;
import com.brekeke.phonedev.utils.Account;
import com.brekeke.phonedev.utils.Ctx;
import com.brekeke.phonedev.utils.L;
import com.brekeke.phonedev.utils.Ringtone;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import com.google.firebase.messaging.RemoteMessage;
import io.wazo.callkeep.RNCallKeepModule;
import io.wazo.callkeep.VoiceConnectionService;
import java.io.IOException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import org.json.JSONObject;

public class BrekekeUtils extends ReactContextBaseJavaModule {
  public static RCTDeviceEventEmitter eventEmitter;
  public static Promise defaultDialerPromise;
  public static Promise disableBatteryOptimizationPromise;
  public static Promise androidLpcPermPromise;
  public static Promise overlayScreenPromise;
  private static String TAG = "[BrekekeUtils]";

  public static WritableMap parseParams(RemoteMessage m) {
    var p = Arguments.createMap();
    p.putString("from", m.getFrom());
    p.putString("google.message_id", m.getMessageId());
    p.putString("google.to", m.getTo());
    p.putDouble("google.sent_time", m.getSentTime());
    if (m.getData() != null) {
      var d = m.getData();
      for (var k : d.keySet()) {
        p.putString(k, d.get(k));
      }
    }
    return p;
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
  public static ActivityResultLauncher<Intent> defaultDialerLauncher;
  public static KeyguardManager km;
  public static AudioManager am;
  public static Vibrator vib;

  public static boolean isAppActive = false;
  public static boolean isAppActiveLocked = false;
  public static boolean firstShowCallAppActive = false;
  public static boolean phoneappliEnabled = false;
  public static String userAgentConfig = null;

  BrekekeUtils(ReactApplicationContext c) {
    super(c);
    Ctx.wakeFromMainRn(c);
    initStaticServices();
    debugAudioListener();
  }

  private void debugAudioListener() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
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
    var e = Ctx.app().getMainExecutor();
    am.addOnModeChangedListener(e, l1);
    am.addOnCommunicationDeviceChangedListener(e, l2);
  }

  @Override
  public void initialize() {
    super.initialize();
    var c = Ctx.main();
    eventEmitter = c.getJSModule(RCTDeviceEventEmitter.class);
  }

  @Override
  public String getName() {
    return "BrekekeUtils";
  }

  // [callkeepUuid] -> display/answerCall/rejectCall
  public static Map<String, String> userActions = new HashMap<String, String>();

  public static void initStaticServices() {
    var c = Ctx.app();
    if (wl == null) {
      var pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
      wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "BrekekePhone::BrekekeUtils");
    }
    if (km == null) {
      km = (KeyguardManager) c.getSystemService(Context.KEYGUARD_SERVICE);
    }
    if (am == null) {
      am = (AudioManager) c.getSystemService(Context.AUDIO_SERVICE);
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
      var aURL = new URL(url.toLowerCase());
      var p = Pattern.compile(".(jpeg|jpg|gif|png)$");
      var m = p.matcher(aURL.getPath());
      return m.find();
    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }

  // interval for the case js set rejectCall even before activity start/starting
  public static Map<String, String> destroyedUuids = new HashMap<String, String>();

  public static void intervalCheckRejectCall(String uuid) {
    var h = new Handler();
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

  public static void onFcmMessageReceived(Map<String, String> data) {
    // check if it is a PN for incoming call
    if (data.get("x_pn-id") == null) {
      return;
    }
    // init services if not
    initStaticServices();
    acquireWakeLock();
    // generate new uuid and store it to the PN bundle
    var now = new SimpleDateFormat("HH:mm:ss.SSS", Locale.getDefault()).format(new Date());
    data.put("callkeepAt", now);
    var uuid = UUID.randomUUID().toString().toUpperCase();
    data.put("callkeepUuid", uuid);
    if (Account.find(data) == null) {
      return;
    }
    // show call
    var displayName = data.get("x_displayname");
    if (displayName == null || displayName.isEmpty()) {
      displayName = data.get("x_from");
    }
    if (displayName == null || displayName.isEmpty()) {
      displayName = "Loading...";
    }

    // redeclare as final to put in nested class
    var callerName = displayName;
    var avatar = data.get("x_image");
    var avatarSize = data.get("x_image_size");
    var autoAnswer = toBoolean(data.get("x_autoanswer"));
    //  determine ringtone to use for the incoming call.
    var ringtone = data.get("x_ringtone");
    var username = data.get("x_to");
    var tenant = data.get("x_tenant");
    var host = data.get("x_host");
    var port = data.get("x_port");

    var appCtx = Ctx.app();
    RNCallKeepModule.registerPhoneAccount(appCtx);

    var onShowIncomingCallUi =
        new Runnable() {
          @Override
          public void run() {
            var a = userActions.get(uuid);
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
            var i = new Intent(appCtx, IncomingCallActivity.class);

            i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_MULTIPLE_TASK);
            i.putExtra("uuid", uuid);
            i.putExtra("callerName", callerName);
            i.putExtra("avatar", avatar);
            i.putExtra("avatarSize", avatarSize);
            i.putExtra("autoAnswer", autoAnswer);

            if (ringtone == null) {
              i.putExtra("ringtone", Ringtone.getRingtoneFromUser(username, tenant, host, port));
            } else {
              i.putExtra("ringtone", Ringtone.getRingtoneByName(ringtone));
            }
            var c = Ctx.app();
            c.startActivity(i);

            // check if incoming via lpc and show the notification
            var lpc = data.get("lpc");
            if ("true".equals(lpc)) {
              LpcUtils.showIncomingCallNotification(appCtx, i);
            }
          }
        };
    Runnable onReject =
        new Runnable() {
          @Override
          public void run() {
            onPassiveReject(uuid);
          }
        };
    // try to run onShowIncomingCallUi if there is already an ongoing call
    if (VoiceConnectionService.currentConnections.size() > 0
        || RNCallKeepModule.onShowIncomingCallUiCallbacks.size() > 0
        || activitiesSize > 0) {
      onShowIncomingCallUi.run();
    }

    RNCallKeepModule.onShowIncomingCallUiCallbacks.put(uuid, onShowIncomingCallUi);
    RNCallKeepModule.onRejectCallbacks.put(uuid, onReject);
    RNCallKeepModule.staticDisplayIncomingCall(uuid, "Brekeke Phone", callerName, false, null);
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
      var c = Ctx.app();
      var i = new Intent(c, ExitActivity.class);
      i.addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK
              | Intent.FLAG_ACTIVITY_CLEAR_TASK
              | Intent.FLAG_ACTIVITY_NO_ANIMATION
              | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
      c.startActivity(i);
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
    var a = at(uuid);
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
    var atLeastOneAnswerPressed = false;
    try {
      for (var a : activities) {
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
      for (var a : activities) {
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
      for (var a : activities) {
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
      for (var a : activities) {
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
      for (var a : activities) {
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
      for (var a : activities) {
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

  public static void staticStartRingtone(String ringtone) {
    try {
      prepareStartRingtone();
      playRingtone(Ringtone.validateRingtone(ringtone));
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private static void prepareStartRingtone() {
    if (mp != null) {
      return;
    }
    int mode = am.getRingerMode();
    if (mode == AudioManager.RINGER_MODE_SILENT) {
      return;
    }
    if (vib == null) {
      vib = (Vibrator) Ctx.app().getSystemService(Context.VIBRATOR_SERVICE);
    }
    var pattern = new long[] {0, 1000, 1000};
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      vib.vibrate(VibrationEffect.createWaveform(pattern, new int[] {0, 255, 0}, 0));
    } else {
      vib.vibrate(pattern, 0);
    }
    if (mode == AudioManager.RINGER_MODE_VIBRATE) {
      return;
    }
    am.setMode(AudioManager.MODE_RINGTONE);
  }

  private static void playRingtone(String ringtone) {
    try {
      Log.d(TAG, "playRingtone: " + ringtone);
      if (Ringtone.checkStaticRingtone(ringtone)) {
        playStaticRingtone(ringtone);
      }

      playSystemRingtone(ringtone);
    } catch (Exception ignored) {
    }
  }

  private static void playSystemRingtone(String ringtoneUri) throws IOException {
    var uri = Uri.parse(ringtoneUri);
    mp = new MediaPlayer();
    mp.setAudioAttributes(createAudioAttributes());
    mp.setDataSource(Ctx.app(), uri);
    mp.setVolume(1.0f, 1.0f);
    mp.setLooping(true);
    mp.prepare();
    mp.start();
  }

  private static void playStaticRingtone(String ringtone) throws IOException {
    mp =
        MediaPlayer.create(
            Ctx.app(),
            Ringtone.getRingtoneFromRaw(ringtone),
            createAudioAttributes(),
            am.generateAudioSessionId());
    mp.setVolume(1.0f, 1.0f);
    mp.setLooping(true);
    mp.start();
  }

  private static AudioAttributes createAudioAttributes() {
    return new AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_UNKNOWN)
        .setLegacyStreamType(AudioManager.STREAM_RING)
        .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
        .build();
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

  public static boolean checkReadPhonePermission() {
    var c = Ctx.app();
    if (checkSelfPermission(c, permission.READ_PHONE_NUMBERS)
        == PackageManager.PERMISSION_GRANTED) {
      return true;
    }
    return false;
  }

  public static boolean checkNotificationPermission() {
    var c = Ctx.app();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      return checkSelfPermission(c, permission.POST_NOTIFICATIONS)
          == PackageManager.PERMISSION_GRANTED;
    }
    return NotificationManagerCompat.from(c).areNotificationsEnabled();
  }

  public static void resolveDefaultDialer(String msg) {
    if (defaultDialerPromise != null) {
      defaultDialerPromise.resolve(msg);
      defaultDialerPromise = null;
    }
  }

  public void checkDefaultDialer() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || main == null) {
      resolveDefaultDialer("Not supported on this Anrdoid version");
      return;
    }
    var c = Ctx.app();
    var tm = (TelecomManager) c.getSystemService(TELECOM_SERVICE);
    if (tm == null) {
      resolveDefaultDialer("TelecomManager is null");
      return;
    }
    var packageName = c.getPackageName();
    if (packageName.equals(tm.getDefaultDialerPackage())) {
      resolveDefaultDialer("Already the default dialer");
      return;
    }
    var intent =
        new Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER)
            .putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, packageName);
    if (intent.resolveActivity(c.getPackageManager()) == null) {
      resolveDefaultDialer("No activity to handle the intent");
      return;
    }
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
      defaultDialerLauncher.launch(intent);
    } else {
      var rm = main.getSystemService(RoleManager.class);
      if (rm != null && rm.isRoleAvailable(RoleManager.ROLE_DIALER)) {
        defaultDialerLauncher.launch(rm.createRequestRoleIntent(RoleManager.ROLE_DIALER));
      }
    }
  }

  public static boolean toBoolean(String s) {
    if (s != null) {
      return s.equals("on") || s.equals("true") || s.equals("1") || Boolean.parseBoolean(s);
    }
    return false;
  }

  // perm Ignoring Battery Optimization
  public static boolean isIgnoringBatteryOptimizationPermissionGranted() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      return true;
    }
    var c = Ctx.app();
    var pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
    return pm.isIgnoringBatteryOptimizations(c.getPackageName());
  }

  public static void resolveIgnoreBattery(boolean result) {
    if (disableBatteryOptimizationPromise != null) {
      disableBatteryOptimizationPromise.resolve(result);
      disableBatteryOptimizationPromise = null;
    }
  }

  public static void requestDisableBatteryOptimization() {
    var c = Ctx.app();
    var i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
    i.setData(Uri.parse("package:" + c.getPackageName()));
    i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    c.startActivity(i);
  }

  // overlay screen permission
  public static boolean isOverlayPermissionGranted() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      return true;
    }
    var c = Ctx.app();
    return Settings.canDrawOverlays(c);
  }

  public static void requestOverlayScreenOptimization() {
    var c = Ctx.app();
    var i =
        new Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + c.getPackageName()));
    i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    c.startActivity(i);
  }

  public static void resolveOverlayScreen(boolean result) {
    if (overlayScreenPromise != null) {
      overlayScreenPromise.resolve(result);
      overlayScreenPromise = null;
    }
  }

  public static boolean isUserAgentConfig() {
    return BrekekeUtils.userAgentConfig != null && !BrekekeUtils.userAgentConfig.equals("");
  }

  // ==========================================================================
  // react methods
  @ReactMethod
  public void setAudioMode(int mode) {
    if (am == null) {
      return;
    }
    switch (mode) {
      case AudioManager.MODE_NORMAL:
        am.setMode(AudioManager.MODE_NORMAL);
        break;
      case AudioManager.MODE_RINGTONE:
        am.setMode(AudioManager.MODE_RINGTONE);
        break;
      case AudioManager.MODE_IN_CALL:
        am.setMode(AudioManager.MODE_IN_CALL);
        break;
      case AudioManager.MODE_IN_COMMUNICATION:
        am.setMode(AudioManager.MODE_IN_COMMUNICATION);
        break;
      case AudioManager.MODE_CALL_SCREENING:
        am.setMode(AudioManager.MODE_CALL_SCREENING);
        break;
      default:
        am.setMode(AudioManager.MODE_NORMAL);
        break;
    }
  }

  @ReactMethod
  public void updateAnyHoldLoading(boolean isAnyHoldLoading) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              for (var a : activities) {
                try {
                  a.updateEnableSwitchCall(!isAnyHoldLoading);
                } catch (Exception e) {
                }
              }
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void toast(String uuid, String m, String d, String t) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).toast(m, d, t);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void updateConnectionStatus(String msg, boolean isConnFailure) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              for (var a : activities) {
                try {
                  a.updateConnectionStatus(msg, isConnFailure);
                } catch (Exception e) {
                }
              }
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void updateRqStatus(String uuid, String name, boolean isLoading) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).updateBtnRqStatus(name, isLoading);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setUserAgentConfig(String userAgentConfig) {
    if (BrekekeUtils.userAgentConfig == null) {
      UiThreadUtil.runOnUiThread(
          new Runnable() {
            @Override
            public void run() {
              try {
                for (var a : activities) {
                  try {
                    a.updateUserAgentConfig(userAgentConfig);
                  } catch (Exception e) {
                    BrekekeUtils.emit(
                        "debug", "IncomingCallActivity::updateUserAgentConfig " + e.getMessage());
                  }
                }
              } catch (Exception e) {
                BrekekeUtils.emit(
                    "debug", "IncomingCallActivity::updateUserAgentConfig " + e.getMessage());
              }
            }
          });
    }
    BrekekeUtils.userAgentConfig = userAgentConfig;
  }

  @ReactMethod
  public void isOverlayPermissionGranted(Promise p) {
    p.resolve(isOverlayPermissionGranted());
  }

  @ReactMethod
  public void isDisableBatteryOptimizationGranted(Promise p) {
    p.resolve(isIgnoringBatteryOptimizationPermissionGranted());
  }

  @ReactMethod
  public void permDisableBatteryOptimization(Promise p) {
    disableBatteryOptimizationPromise = p;
    requestDisableBatteryOptimization();
  }

  @ReactMethod
  public void permOverlay(Promise p) {
    overlayScreenPromise = p;
    requestOverlayScreenOptimization();
  }

  @ReactMethod
  public void checkPermissionDefaultDialer(Promise p) {
    defaultDialerPromise = p;
    checkDefaultDialer();
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
  public void startRingtone(String username, String tenant, String host, String port) {
    staticStartRingtone(Ringtone.getRingtoneFromUser(username, tenant, host, port));
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
  public void hasIncomingCallActivity(String uuid, Promise p) {
    try {
      p.resolve(at(uuid) != null);
    } catch (Exception e) {
      p.resolve(false);
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
              var o = new JSONObject(jsonStr);
              for (var a : activities) {
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
              var a = at(uuid);
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
  public void setIsVideoCall(String uuid, boolean isVideoCall, boolean isMuted) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setBtnVideoSelected(isVideoCall, isMuted);
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
              for (var a : activities) {
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
    L.set(locale);
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              for (var a : activities) {
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
  public void setPhoneappliEnabled(Boolean isEnabled) {
    phoneappliEnabled = isEnabled;
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
                var a = at(uuid);
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
            var toFront = at(uuid);
            emit("debug", "onPageCallManage uuid=" + uuid + " toFront==null " + (toFront == null));
            if (toFront != null) {
              toFront.reorderToFront();
            }
          }
        });
  }

  @ReactMethod
  public void getRingerMode(Promise p) {
    if (am == null) {
      p.resolve(-1);
    }
    try {
      p.resolve(am.getRingerMode());
    } catch (Exception e) {
      emit("debug", "getRingerMode error: " + e.getMessage());
      p.resolve(-1);
    }
  }

  @ReactMethod
  public void insertCallLog(String number, int type) {
    var c = Ctx.app();
    var v = new ContentValues();
    v.put(CallLog.Calls.NUMBER, number);
    v.put(CallLog.Calls.DATE, System.currentTimeMillis());
    v.put(CallLog.Calls.TYPE, type);
    v.put(CallLog.Calls.CACHED_NAME, "Brekeke Phone");
    c.getContentResolver().insert(CallLog.Calls.CONTENT_URI, v);
  }

  @ReactMethod
  public void systemUptimeMs(Promise p) {
    try {
      p.resolve((double) SystemClock.elapsedRealtime());
    } catch (Exception e) {
      p.resolve(-1d);
    }
  }

  // android lpc

  @ReactMethod
  public void enableLPC(
      String token,
      String tokenVoip,
      String username,
      String host,
      int port,
      ReadableArray remoteSsids,
      String localSsid,
      String tlsKeyHash) {
    var c = Ctx.app();
    var i =
        LpcUtils.putConfigToIntent(
            host, port, token, username, tlsKeyHash, new Intent(c, BrekekeLpcService.class));
    c.startForegroundService(i);
    c.bindService(i, LpcUtils.connection, BrekekeLpcService.BIND_AUTO_CREATE);
    // update the status if the server turns lpc on or off
    if (LpcUtils.LpcCallback.cb == null) {
      LpcUtils.LpcCallback.setLpcCallback(
          v -> {
            if (!v) {
              disableLPC();
            }
          });
    }
  }

  @ReactMethod
  public void disableLPC() {
    try {
      if (BrekekeLpcService.isServiceStarted) {
        var c = Ctx.app();
        c.unbindService(LpcUtils.connection);
      }
    } catch (Exception e) {
      Log.d(TAG, "disableLPC: " + e.getMessage());
    }
  }

  // "Show on lock screen"
  // "Open new window when running in background"
  // "Displaying popup windows while running in the background"
  @ReactMethod
  void androidLpcPermIncomingCall(Promise p) {
    if (LpcUtils.androidLpcIsPermGranted()) {
      return;
    }
    var c = Ctx.app();
    Intent i = null;
    if (LpcUtils.isMIUI()) {
      i = LpcUtils.getPermissionManagerIntent(c);
      i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_MULTIPLE_TASK);
    } else {
      // TODO: check for other OS
      p.resolve(true);
      return;
    }
    androidLpcPermPromise = p;
    c.startActivity(i);
  }

  @ReactMethod
  public void androidLpcIsPermGranted(Promise p) {
    p.resolve(LpcUtils.androidLpcIsPermGranted());
  }

  public static void androidLpcResolvePerm(boolean result) {
    if (androidLpcPermPromise != null) {
      androidLpcPermPromise.resolve(result);
      androidLpcPermPromise = null;
    }
  }

  // android video conference

  @ReactMethod
  public void setRemoteStreams(String uuid, ReadableArray streams) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setRemoteStreams(streams);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setStreamActive(String uuid, ReadableMap stream) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setStreamActive(stream);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setLocalStream(String uuid, String streamUrl) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setLocalStream(streamUrl);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void addStreamToView(String uuid, ReadableMap stream) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).addStreamToView(stream);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void removeStreamFromView(String uuid, String vId) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).removeStreamFromView(vId);
            } catch (Exception e) {
            }
          }
        });
  }

  @ReactMethod
  public void setOptionsRemoteStream(String uuid, ReadableArray arr) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              at(uuid).setOptionsRemoteStream(arr);
            } catch (Exception e) {
            }
          }
        });
  }

  // Ringtone

  @ReactMethod
  public void getRingtoneOptions(Promise promise) {
    try {
      var c = Ctx.app();
      var ringtoneList = new WritableNativeArray();
      var ringtoneManager = new RingtoneManager(c);
      ringtoneManager.setType(RingtoneManager.TYPE_RINGTONE);
      var cursor = ringtoneManager.getCursor();
      while (cursor.moveToNext()) {
        var title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX);
        var uri = ringtoneManager.getRingtoneUri(cursor.getPosition());
        ringtoneList.pushMap(Ringtone.handleRingtoneList(title, uri.toString()));
      }
      cursor.close();

      for (var sRingtone : Ringtone.staticRingtones) {
        ringtoneList.pushMap(Ringtone.handleRingtoneList(sRingtone, sRingtone));
      }

      promise.resolve(ringtoneList);
    } catch (Exception e) {
      promise.reject("RINGTONE_ERROR", "Failed to get ringtones", e);
    }
  }

  @ReactMethod
  public void playRingtoneByName(String ringtone) {
    staticStartRingtone(Ringtone.getRingtoneByName(ringtone));
  }
}
