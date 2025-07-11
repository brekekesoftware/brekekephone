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
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.PowerManager;
import android.os.PowerManager.WakeLock;
import android.os.SystemClock;
import android.provider.CallLog;
import android.provider.Settings;
import android.telecom.TelecomManager;
import android.text.TextUtils;
import androidx.activity.result.ActivityResultLauncher;
import androidx.core.app.NotificationManagerCompat;
import com.brekeke.phonedev.activity.ExitActivity;
import com.brekeke.phonedev.activity.IncomingCallActivity;
import com.brekeke.phonedev.lpc.BrekekeLpcService;
import com.brekeke.phonedev.lpc.LpcUtils;
import com.brekeke.phonedev.push_notification.BrekekeMessagingService;
import com.brekeke.phonedev.utils.Account;
import com.brekeke.phonedev.utils.Ctx;
import com.brekeke.phonedev.utils.Emitter;
import com.brekeke.phonedev.utils.L;
import com.brekeke.phonedev.utils.PN;
import com.brekeke.phonedev.utils.Ringtone;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import io.wazo.callkeep.RNCallKeepModule;
import io.wazo.callkeep.VoiceConnectionService;
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
  public static Promise defaultDialerPromise;
  public static Promise disableBatteryOptimizationPromise;
  public static Promise androidLpcPermPromise;
  public static Promise overlayScreenPromise;
  private static String TAG = "[BrekekeUtils]";

  public static WakeLock wl;

  public static void acquireWakeLock() {
    if (!wl.isHeld()) {
      Emitter.debug("calling wl.acquire()");
      wl.acquire();
    }
  }

  public static void releaseWakeLock() {
    if (wl.isHeld()) {
      Emitter.debug("calling wl.release()");
      wl.release();
    }
  }

  public static Activity main;
  public static ActivityResultLauncher<Intent> defaultDialerLauncher;
  public static KeyguardManager km;

  public static boolean isAppActive = false;
  public static boolean isAppActiveLocked = false;
  public static boolean firstShowCallAppActive = false;
  public static boolean phoneappliEnabled = false;
  public static String userAgentConfig = null;

  BrekekeUtils(ReactApplicationContext ctx) {
    super(ctx);
    Ctx.wakeFromMainRn(ctx);
    initStaticServices();
  }

  @Override
  public void initialize() {
    super.initialize();
    Emitter.init();
  }

  @Override
  public String getName() {
    return "BrekekeUtils";
  }

  // [callkeepUuid] -> display/answerCall/rejectCall
  public static Map<String, String> userActions = new HashMap<String, String>();

  public static void initStaticServices() {
    var ctx = Ctx.app();
    if (wl == null) {
      var pm = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
      wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "BrekekePhone::BrekekeUtils");
    }
    if (km == null) {
      km = (KeyguardManager) ctx.getSystemService(Context.KEYGUARD_SERVICE);
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

  public static void onFcmMessageReceived(Map<String, String> m) {
    // check if it is a PN for incoming call
    if (PN.id(m) == null) {
      return;
    }
    if (Account.find(m) == null) {
      Emitter.error("onFcmMessageReceived", "account 404");
      return;
    }
    // init services if not
    initStaticServices();
    acquireWakeLock();
    // generate new uuid and store it to the PN bundle
    var now = new SimpleDateFormat("HH:mm:ss.SSS", Locale.getDefault()).format(new Date());
    m.put("callkeepAt", now);
    var uuid = UUID.randomUUID().toString().toUpperCase();
    m.put("callkeepUuid", uuid);
    // get caller display name to display the incoming call
    var displayName = PN.displayName(m);
    if (TextUtils.isEmpty(displayName)) {
      displayName = PN.from(m);
    }
    if (TextUtils.isEmpty(displayName)) {
      displayName = "Loading...";
    }
    var ctx = Ctx.app();
    RNCallKeepModule.registerPhoneAccount(ctx);
    // redeclare as final to put in nested class
    final var lpc = toBoolean(m.get("lpc"));
    final var callerName = displayName;
    final var avatar = PN.image(m);
    final var avatarSize = PN.imageSize(m);
    final var autoAnswer = toBoolean(PN.autoAnswer(m));
    final var ringtone =
        Ringtone.get(PN.ringtone(m), PN.username(m), PN.tenant(m), PN.host(m), PN.port(m));
    var onShowIncomingCall =
        new Runnable() {
          @Override
          public void run() {
            var a = userActions.get(uuid);
            if (a != null) {
              if ("rejectCall".equals(a)) {
                RNCallKeepModule.staticEndCall(uuid, ctx);
              }
              return;
            }
            userActions.put(uuid, "display");
            activitiesSize++;
            if (activitiesSize == 1) {
              firstShowCallAppActive = isAppActive || isAppActiveLocked;
            }
            var i = new Intent(ctx, IncomingCallActivity.class);
            i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_MULTIPLE_TASK);
            i.putExtra("uuid", uuid);
            i.putExtra("callerName", callerName);
            i.putExtra("avatar", avatar);
            i.putExtra("avatarSize", avatarSize);
            i.putExtra("autoAnswer", autoAnswer);
            i.putExtra("ringtone", ringtone);
            ctx.startActivity(i);
            if (lpc) {
              LpcUtils.showIncomingCallNotification(ctx, i);
            }
          }
        };
    var onReject =
        new Runnable() {
          @Override
          public void run() {
            onPassiveReject(uuid);
          }
        };
    // try to run onShowIncomingCall if there is already an ongoing call
    if (VoiceConnectionService.currentConnections.size() > 0
        || RNCallKeepModule.onShowIncomingCallUiCallbacks.size() > 0
        || activitiesSize > 0) {
      onShowIncomingCall.run();
    }
    RNCallKeepModule.onShowIncomingCallUiCallbacks.put(uuid, onShowIncomingCall);
    RNCallKeepModule.onRejectCallbacks.put(uuid, onReject);
    RNCallKeepModule.staticDisplayIncomingCall(uuid, "Brekeke Phone", callerName, false, null);
  }

  // when an incoming GSM call is ringing
  //    if another incoming Brekeke Phone call comes
  //    it will be automatically rejected by the system
  // we will manually fire the rejectCall event here
  // there may be duplicated events in some cases, need to test more
  public static void onPassiveReject(String uuid) {
    Emitter.debug("onPassiveReject uuid=" + uuid);
    Emitter.emit("rejectCall", uuid);
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
      var ctx = Ctx.app();
      var i = new Intent(ctx, ExitActivity.class);
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
    var a = at(uuid);
    Emitter.debug("remove a==null " + (a == null));
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
    Emitter.debug("removeAll");
    Ringtone.stop();
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
    Emitter.debug("staticCloseIncomingCall");
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
      Ringtone.stop();
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

  public static boolean checkReadPhonePermission() {
    var ctx = Ctx.app();
    if (checkSelfPermission(ctx, permission.READ_PHONE_NUMBERS)
        == PackageManager.PERMISSION_GRANTED) {
      return true;
    }
    return false;
  }

  public static boolean checkNotificationPermission() {
    var ctx = Ctx.app();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      return checkSelfPermission(ctx, permission.POST_NOTIFICATIONS)
          == PackageManager.PERMISSION_GRANTED;
    }
    return NotificationManagerCompat.from(ctx).areNotificationsEnabled();
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
    var ctx = Ctx.app();
    var tm = (TelecomManager) ctx.getSystemService(TELECOM_SERVICE);
    if (tm == null) {
      resolveDefaultDialer("TelecomManager is null");
      return;
    }
    var packageName = ctx.getPackageName();
    if (packageName.equals(tm.getDefaultDialerPackage())) {
      resolveDefaultDialer("Already the default dialer");
      return;
    }
    var intent =
        new Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER)
            .putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, packageName);
    if (intent.resolveActivity(ctx.getPackageManager()) == null) {
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
    if (TextUtils.isEmpty(s)) {
      return false;
    }
    var l = s.toLowerCase();
    return l.equals("on") || l.equals("true") || l.equals("1") || Boolean.parseBoolean(l);
  }

  // perm Ignoring Battery Optimization
  public static boolean isIgnoringBatteryOptimizationPermissionGranted() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      return true;
    }
    var ctx = Ctx.app();
    var pm = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
    return pm.isIgnoringBatteryOptimizations(ctx.getPackageName());
  }

  public static void resolveIgnoreBattery(boolean result) {
    if (disableBatteryOptimizationPromise != null) {
      disableBatteryOptimizationPromise.resolve(result);
      disableBatteryOptimizationPromise = null;
    }
  }

  public static void requestDisableBatteryOptimization() {
    var ctx = Ctx.app();
    var i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
    i.setData(Uri.parse("package:" + ctx.getPackageName()));
    i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    ctx.startActivity(i);
  }

  // overlay screen permission
  public static boolean isOverlayPermissionGranted() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      return true;
    }
    var ctx = Ctx.app();
    return Settings.canDrawOverlays(ctx);
  }

  public static void requestOverlayScreenOptimization() {
    var ctx = Ctx.app();
    var i =
        new Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:" + ctx.getPackageName()));
    i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    ctx.startActivity(i);
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
    try {
      Ringtone.setAudioMode(mode);
    } catch (Exception e) {
    }
  }

  @ReactMethod
  public void getRingerMode(Promise p) {
    try {
      p.resolve(Ringtone.getRingerMode());
    } catch (Exception e) {
      Emitter.error("getRingerMode", e.getMessage());
      p.resolve(-1);
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
                    a.setUserAgentConfig(userAgentConfig);
                  } catch (Exception e) {
                    Emitter.error("a.setUserAgentConfig", e.getMessage());
                  }
                }
              } catch (Exception e) {
                Emitter.error("setUserAgentConfig", e.getMessage());
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
  public void startRingtone(String u, String t, String h, String p) {
    Ringtone.play(Ringtone.get(u, t, h, p));
  }

  @ReactMethod
  public void stopRingtone() {
    Ringtone.stop();
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
    Emitter.debug("closeIncomingCall uuid=" + uuid);
    staticCloseIncomingCall(uuid);
  }

  @ReactMethod
  public void closeAllIncomingCalls() {
    Emitter.debug("closeAllIncomingCalls");
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
    Emitter.debug("setRecordingStatus uuid=" + uuid + " isRecording=" + isRecording);
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
            Emitter.debug("onPageCallManage uuid=" + uuid + " toFront==null " + (toFront == null));
            if (toFront != null) {
              toFront.reorderToFront();
            }
          }
        });
  }

  @ReactMethod
  public void insertCallLog(String number, int type) {
    var ctx = Ctx.app();
    var v = new ContentValues();
    v.put(CallLog.Calls.NUMBER, number);
    v.put(CallLog.Calls.DATE, System.currentTimeMillis());
    v.put(CallLog.Calls.TYPE, type);
    v.put(CallLog.Calls.CACHED_NAME, "Brekeke Phone");
    ctx.getContentResolver().insert(CallLog.Calls.CONTENT_URI, v);
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
    var ctx = Ctx.app();
    var i =
        LpcUtils.putConfigToIntent(
            host, port, token, username, tlsKeyHash, new Intent(ctx, BrekekeLpcService.class));
    ctx.startForegroundService(i);
    ctx.bindService(i, LpcUtils.connection, BrekekeLpcService.BIND_AUTO_CREATE);
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
        var ctx = Ctx.app();
        ctx.unbindService(LpcUtils.connection);
      }
    } catch (Exception e) {
      Emitter.error("disableLPC", e.getMessage());
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
    var ctx = Ctx.app();
    Intent i = null;
    if (LpcUtils.isMIUI()) {
      i = LpcUtils.getPermissionManagerIntent(ctx);
      i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_MULTIPLE_TASK);
    } else {
      // TODO: check for other OS
      p.resolve(true);
      return;
    }
    androidLpcPermPromise = p;
    ctx.startActivity(i);
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
  public void getRingtoneOptions(Promise p) {
    try {
      p.resolve(Ringtone.options());
    } catch (Exception e) {
      p.reject("RINGTONE_ERROR", "Failed to get ringtone options", e);
    }
  }

  @ReactMethod
  public void playRingtoneByName(String r) {
    Ringtone.play(r);
  }
}
