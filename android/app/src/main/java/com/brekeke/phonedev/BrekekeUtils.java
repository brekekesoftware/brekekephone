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
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.database.Cursor;
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
import com.brekeke.phonedev.utils.L;
import com.brekeke.phonedev.utils.ToastType;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import com.google.firebase.messaging.RemoteMessage;
import com.reactnativecommunity.asyncstorage.AsyncLocalStorageUtil;
import com.reactnativecommunity.asyncstorage.ReactDatabaseSupplier;
import io.wazo.callkeep.RNCallKeepModule;
import io.wazo.callkeep.VoiceConnectionService;
import java.io.IOException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
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
  public static Promise defaultDialerPromise;
  public static Promise disableBatteryOptimizationPromise;
  public static Promise androidLpcPermPromise;
  public static Promise overlayScreenPromise;
  private static String[] staticRingtones = {"incallmanager_ringtone"};
  private static String TAG = "[BrekekeUtils]";
  public static WritableMap parseParams(RemoteMessage message) {
    WritableMap params = Arguments.createMap();
    params.putString("from", message.getFrom());
    params.putString("google.message_id", message.getMessageId());
    params.putString("google.to", message.getTo());
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
  public static ActivityResultLauncher<Intent> defaultDialerLauncher;
  public static ReactApplicationContext ctx;
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
    ctx = c;
    initStaticServices(c);
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
    // check if it is a PN for incoming call
    if (data.get("x_pn-id") == null) {
      return;
    }
    // init services if not
    initStaticServices(c);
    acquireWakeLock();
    // generate new uuid and store it to the PN bundle
    String now = new SimpleDateFormat("HH:mm:ss.SSS", Locale.getDefault()).format(new Date());
    data.put("callkeepAt", now);
    String uuid = UUID.randomUUID().toString().toUpperCase();
    data.put("callkeepUuid", uuid);
    // check if the account exist and load the locale
    Context appCtx = c.getApplicationContext();
    if (!checkAccountExist(appCtx, data)) {
      return;
    }
    prepareLocale(appCtx);
    // show call
    String displayName = data.get("x_displayname");
    if (displayName == null || displayName.isEmpty()) {
      displayName = data.get("x_from");
    }
    if (displayName == null || displayName.isEmpty()) {
      displayName = "Loading...";
    }

    // redeclare as final to put in nested class
    String callerName = displayName;
    String avatar = data.get("x_image");
    String avatarSize = data.get("x_image_size");
    boolean autoAnswer = toBoolean(data.get("x_autoanswer"));
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
            Intent i = new Intent(appCtx, IncomingCallActivity.class);

            i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_MULTIPLE_TASK);
            i.putExtra("uuid", uuid);
            i.putExtra("callerName", callerName);
            i.putExtra("avatar", avatar);
            i.putExtra("avatarSize", avatarSize);
            i.putExtra("autoAnswer", autoAnswer);
            //  determine ringtone to use for the incoming call.
            String ringtoneName = data.get("x_ringtone");
            if(ringtoneName == null) {
              String ringtoneId = data.get("x_to") + data.get("x_tenant") + data.get("x_host");
              i.putExtra("ringtone" , getRingtoneName(ringtoneId));
            }else {
              i.putExtra("ringtone" , ringtoneName);
            }

            c.startActivity(i);

            // check if incoming via lpc and show the notification
            String fromLpc = data.get("fromLpc");
            if (fromLpc != null && "true".equalsIgnoreCase(fromLpc)) {
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

  public static void staticStartRingtone(String ringtoneUri) {
    try {
      Context c = prepareStartRingtone();
      if(c != null) {
        boolean played = playRingtone(ringtoneUri, c);
        if(!played) {
          playStaticRingtone(staticRingtones[0], c); // play default ringtone
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private static Context prepareStartRingtone() {
      if (mp != null) {
        return null;
      }
      Context c = ctx != null ? ctx : fcm;
      int mode = am.getRingerMode();
      if (mode == AudioManager.RINGER_MODE_SILENT) {
        return null;
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
        return null;
      }
      am.setMode(AudioManager.MODE_RINGTONE);
      return c;
  }

  private static boolean playRingtone(String name, Context c) {
    Cursor cursor = null;
    try {
      if(checkStaticRingtone(name)) {
        playStaticRingtone(name, c);
        return true;
      }

      RingtoneManager ringtoneManager = new RingtoneManager(ctx);
      ringtoneManager.setType(RingtoneManager.TYPE_RINGTONE);

      cursor = ringtoneManager.getCursor();
      while (cursor.moveToNext()) {
        String title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX);
        if(title.equals(name)) {
          Uri uri = ringtoneManager.getRingtoneUri(cursor.getPosition());
          playSystemRingtone(uri.toString(), c);
          return true;
        }
      }
      return false;
    } catch (Exception e) {
      return false;
    } finally {
      if (cursor != null && !cursor.isClosed()) {
        cursor.close();
      }
    }
  }

  private static void playSystemRingtone(String ringtoneUri , Context c) throws IOException {
    Uri uri = Uri.parse(ringtoneUri);
    mp = new MediaPlayer();
    mp.setAudioAttributes(createAudioAttributes());
    mp.setDataSource(c, uri);
    mp.setVolume(1.0f, 1.0f);
    mp.setLooping(true);
    mp.prepare();
    mp.start();
  }

  private static void playStaticRingtone(String ringtoneName, Context c) throws IOException {
    mp =
            MediaPlayer.create(
                    c, getRingtoneFromRaw(ringtoneName),
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

  public static boolean checkReadPhonePermission(Context ctx) {
    if (checkSelfPermission(ctx, permission.READ_PHONE_NUMBERS)
        == PackageManager.PERMISSION_GRANTED) {
      return true;
    }
    return false;
  }

  public static boolean checkNotificationPermission(Context ctx) {
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
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || ctx == null || main == null) {
      resolveDefaultDialer("Not supported on this Anrdoid version");
      return;
    }
    TelecomManager tm = (TelecomManager) ctx.getSystemService(TELECOM_SERVICE);
    if (tm == null) {
      resolveDefaultDialer("TelecomManager is null");
      return;
    }
    String packageName = ctx.getPackageName();
    if (packageName.equals(tm.getDefaultDialerPackage())) {
      resolveDefaultDialer("Already the default dialer");
      return;
    }
    Intent intent =
        new Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER)
            .putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, packageName);
    if (intent.resolveActivity(ctx.getPackageManager()) == null) {
      resolveDefaultDialer("No activity to handle the intent");
      return;
    }
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
      defaultDialerLauncher.launch(intent);
    } else {
      RoleManager rm = main.getSystemService(RoleManager.class);
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
  public static boolean isIgnoringBatteryOptimizationPermissionGranted(Context context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      return true;
    }
    PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
    return powerManager.isIgnoringBatteryOptimizations(context.getPackageName());
  }

  public static void resolveIgnoreBattery(boolean result) {
    if (disableBatteryOptimizationPromise != null) {
      disableBatteryOptimizationPromise.resolve(result);
      disableBatteryOptimizationPromise = null;
    }
  }

  public static void requestDisableBatteryOptimization() {
    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
    intent.setData(Uri.parse("package:" + ctx.getPackageName()));
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    ctx.startActivity(intent);
  }

  // overlay screen permission
  public static boolean isOverlayPermissionGranted(Context context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      return true;
    }
    return Settings.canDrawOverlays(context);
  }

  public static void requestOverlayScreenOptimization() {
    Intent intent =
        new Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:" + ctx.getPackageName()));
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    ctx.startActivity(intent);
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

  // Handle ringtone

  private static int getRingtoneFromRaw (String ringtoneName) {
    int resId = ctx.getResources().getIdentifier(ringtoneName, "raw", ctx.getPackageName());
    if (resId == 0) {
      // fallback
      resId = ctx.getResources().getIdentifier(staticRingtones[0], "raw", ctx.getPackageName());
    }
    return resId;
  }

  private static Boolean checkStaticRingtone(String ringtone) {
    return Arrays.asList(staticRingtones).contains(ringtone); // if true then it uses static ringtone
  }

  public static String getRingtoneName(String ringtoneId) {
    try {
       String data = AsyncLocalStorageUtil.getItemImpl(
                      ReactDatabaseSupplier.getInstance(ctx).getReadableDatabase(), "_api_profiles");
      JSONObject jsonObject = new JSONObject(data);
      JSONArray profilesArray = jsonObject.getJSONArray("profiles");

      for (int i = 0; i < profilesArray.length(); i++) {
        JSONObject profile = profilesArray.getJSONObject(i);

        String tenant = profile.getString("pbxTenant");
        String username = profile.getString("pbxUsername");
        String host = profile.getString("pbxHostname");
        // String ringtoneData = profile.getString("ringtoneData");
        String ringtoneName = profile.getString("ringtoneIndex");
        String rId = username+ tenant +host;
        if(rId.equals(ringtoneId)) {
          return ringtoneName;
        }
      }
    } catch (Exception e) {}
    return staticRingtones[0];
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
              for (IncomingCallActivity a : activities) {
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
  public void showToast(String uuid, String msg, String type, String error) {
    UiThreadUtil.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            try {
              ToastType toastType;
              switch (type.toLowerCase()) {
                case "success":
                  toastType = ToastType.SUCCESS;
                  break;
                case "error":
                  toastType = ToastType.ERROR;
                  break;
                case "warning":
                  toastType = ToastType.WARNING;
                  break;
                case "info":
                  toastType = ToastType.INFO;
                  break;
                default:
                  toastType = ToastType.INFO;
                  break;
              }
              at(uuid).showToast(msg, error, toastType);
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
              for (IncomingCallActivity a : activities) {
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
                for (IncomingCallActivity a : activities) {
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
    p.resolve(isOverlayPermissionGranted(ctx));
  }

  @ReactMethod
  public void isDisableBatteryOptimizationGranted(Promise p) {
    p.resolve(isIgnoringBatteryOptimizationPermissionGranted(ctx));
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
  public void startRingtone(String ringtoneId) {
    staticStartRingtone(getRingtoneName(ringtoneId));
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
    ContentValues values = new ContentValues();
    values.put(CallLog.Calls.NUMBER, number);
    values.put(CallLog.Calls.DATE, System.currentTimeMillis());
    values.put(CallLog.Calls.TYPE, type);
    values.put(CallLog.Calls.CACHED_NAME, "Brekeke Phone");
    ctx.getContentResolver().insert(CallLog.Calls.CONTENT_URI, values);
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
    Intent i =
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
        ctx.unbindService(LpcUtils.connection);
      }
    } catch (Exception e) {
      Log.d(TAG, "disableLPC: " + e.getMessage());
    }
  }

  // handle opening the settings for the user to accept permission for Incoming Call
  // eg: "Show on lock screen" and "Open new window when running in background"
  @ReactMethod
  void androidLpcPermIncomingCall(Promise p) {
    // check "Displaying popup windows while running in the background" to start activity from
    // background
    if (!LpcUtils.androidLpcIsPermGranted(ctx)) {
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
  }

  @ReactMethod
  public void androidLpcIsPermGranted(Promise p) {
    p.resolve(LpcUtils.androidLpcIsPermGranted(ctx));
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
  public void getSystemRingtones(Promise promise) {
    try {
      WritableArray ringtoneList = new WritableNativeArray();
      RingtoneManager ringtoneManager = new RingtoneManager(ctx);
      ringtoneManager.setType(RingtoneManager.TYPE_RINGTONE);

      Cursor cursor = ringtoneManager.getCursor();
      while (cursor.moveToNext()) {
        String title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX);
        Uri uri = ringtoneManager.getRingtoneUri(cursor.getPosition());

        WritableMap ringtone = new WritableNativeMap();
        ringtone.putString("title", title);
        ringtone.putString("uri", uri.toString());
        ringtoneList.pushMap(ringtone);
      }
      cursor.close();
      promise.resolve(ringtoneList);
    } catch (Exception e) {
      promise.reject("RINGTONE_ERROR", "Failed to get ringtones", e);
    }
  }

  @ReactMethod
  public void setStaticRingtones(ReadableArray array) {
    if (array == null) {
      staticRingtones = new String[0];
      return;
    }
    int size = array.size();
    String[] result = new String[size];

    for (int i = 0; i < size; i++) {
      result[i] = array.getString(i);
    }
    staticRingtones = result;
  }

  @ReactMethod
  public void playRingtoneByName(String name , Promise promise) {
    Context c = prepareStartRingtone();
    if(c != null) {
      boolean played = playRingtone(name, c);
      if (played) {
        promise.resolve(true);
      }
      else {
        promise.resolve(false);
      }
    }

  }
}
