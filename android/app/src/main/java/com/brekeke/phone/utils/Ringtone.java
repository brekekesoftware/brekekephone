package com.brekeke.phone.utils;

import android.content.Context;
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
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.text.TextUtils;
import android.util.Pair;
import com.facebook.react.bridge.NativeArray;
import com.facebook.react.bridge.WritableNativeArray;
import java.io.File;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Spliterator;
import java.util.Spliterators;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

// utils to handle ringtone
// see the related part in rn js for reference

public class Ringtone {
  // ==========================================================================
  // init

  public static void init() {
    if (am != null) {
      return;
    }
    var ctx = Ctx.app();
    am = (AudioManager) ctx.getSystemService(Context.AUDIO_SERVICE);
    debug();
  }

  private static void debug() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return;
    }
    var l1 =
        new OnModeChangedListener() {
          @Override
          public void onModeChanged(int m) {
            var k1 = "onModeChanged:mode::";
            var k2 = k1 + "AudioManager.";
            switch (m) {
              case AudioManager.MODE_NORMAL:
                Emitter.debug(k2 + "MODE_NORMAL");
                break;
              case AudioManager.MODE_INVALID:
                Emitter.debug(k2 + "MODE_INVALID");
                break;
              case AudioManager.MODE_CURRENT:
                Emitter.debug(k2 + "MODE_CURRENT");
                break;
              case AudioManager.MODE_RINGTONE:
                Emitter.debug(k2 + "MODE_RINGTONE");
                break;
              case AudioManager.MODE_IN_CALL:
                Emitter.debug(k2 + "MODE_IN_CALL");
                break;
              case AudioManager.MODE_IN_COMMUNICATION:
                Emitter.debug(k2 + "MODE_IN_COMMUNICATION");
                break;
              case AudioManager.MODE_CALL_SCREENING:
                Emitter.debug(k2 + "MODE_CALL_SCREENING");
                break;
              default:
                Emitter.debug(k1 + m);
                break;
            }
          }
        };
    var l2 =
        new OnCommunicationDeviceChangedListener() {
          @Override
          public void onCommunicationDeviceChanged(AudioDeviceInfo device) {
            Emitter.debug(
                "onCommunicationDeviceChanged:AudioDeviceInfo::"
                    + device.getType()
                    + "::"
                    + device.getProductName());
          }
        };
    var ctx = Ctx.app();
    var e = ctx.getMainExecutor();
    am.addOnModeChangedListener(e, l1);
    am.addOnCommunicationDeviceChangedListener(e, l2);
  }

  // ==========================================================================
  // get all ringtone options

  public static NativeArray options() {
    var arr = new WritableNativeArray();
    for (var r : _static) {
      arr.pushString(r);
    }
    var pp = _picker();
    while (pp.hasNext()) {
      arr.pushString(pp.next());
    }
    try (var s = system()) {
      s.forEach(p -> arr.pushString(p.first));
    }
    return arr;
  }

  private static Stream<Pair<String, String>> system() {
    var ctx = Ctx.app();
    var rm = new RingtoneManager(ctx);
    rm.setType(RingtoneManager.TYPE_RINGTONE);
    var c = rm.getCursor();
    var iterator =
        new Iterator<Pair<String, String>>() {
          @Override
          public boolean hasNext() {
            return c.moveToNext();
          }

          @Override
          public Pair<String, String> next() {
            var title = c.getString(RingtoneManager.TITLE_COLUMN_INDEX);
            var uri = rm.getRingtoneUri(c.getPosition()).toString();
            return new Pair<>(title, uri);
          }
        };
    var spliterator =
        (Spliterator<Pair<String, String>>) Spliterators.spliteratorUnknownSize(iterator, 0);
    return StreamSupport.stream(spliterator, false).onClose(c::close);
  }

  // ==========================================================================
  // validate

  private static String[] _static = {"incallmanager_ringtone"};
  public static String _default = _static[0];
  private static String defaultFormat = ".mp3";

  // map ringtone url -> 1 (true) / 0 (false)
  private static Map<String, String> errors = new HashMap<>();

  private static String validate(String r) {
    if (TextUtils.isEmpty(r)) {
      return null;
    }
    if (_static(r)) {
      return r;
    }
    if (https(r)) {
      return r;
    }
    var pp = pickerPath(r);
    if (!pp.isEmpty()) {
      return pp;
    }
    try (var s = system()) {
      return s.filter(p -> p.first.equals(r)).map(p -> p.second).findFirst().orElse(null);
    }
  }

  private static String validateWithError(String r) {
    r = validate(r);
    if (TextUtils.isEmpty(r)) {
      return null;
    }
    if ("1".equals(errors.get(r))) {
      return null;
    }
    return r;
  }

  private static boolean _static(String r) {
    return Arrays.asList(_static).contains(r);
  }

  private static boolean https(String r) {
    return r.startsWith("https://");
  }

  private static String pickerPath(String filename) {
    var ctx = Ctx.app();
    // use the `Ringtones` folder name to sync with the @react-native-documents/picker library patch
    File file = new File(ctx.getFilesDir(), "Ringtones");
    File des = new File(file, filename + defaultFormat);
    if (!des.exists()) {
      return "";
    }
    return des.getAbsolutePath();
  }

  // get from push notification and validate
  public static String get(String r, String u, String t, String h, String p) {
    try {
      var v = validateWithError(r);
      if (!TextUtils.isEmpty(v)) {
        return v;
      }
      return get(u, t, h, p);
    } catch (Exception e) {
    }
    return _default;
  }

  // get from account and validate
  private static String get(String u, String t, String h, String p) {
    try {
      var a = Account.find(u, t, h, p);
      var r = validateWithError(a.getString("ringtone"));
      if (!TextUtils.isEmpty(r)) {
        return r;
      }
      r = validateWithError(a.getString("pbxRingtone"));
      if (!TextUtils.isEmpty(r)) {
        return r;
      }
    } catch (Exception e) {
    }
    return _default;
  }

  // ==========================================================================
  // play

  // static globally
  private static AudioManager am;

  // static but reinit each play
  private static Vibrator vib;
  private static MediaPlayer mp;

  private static int PLAY_TIMEOUT = 1000;
  private static Runnable onError;
  private static Handler h;

  private static Data d = new Data();

  public static boolean play(String r, String u, String t, String h, String p) {
    if (mp != null) {
      // return false if already playing
      return false;
    }
    d.set(r, u, t, h, p);
    int m = am.getRingerMode();
    if (m == AudioManager.RINGER_MODE_SILENT) {
      return true;
    }
    var ctx = Ctx.app();
    if (vib == null) {
      vib = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
    }
    var pattern = new long[] {0, 1000, 1000};
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      vib.vibrate(VibrationEffect.createWaveform(pattern, new int[] {0, 255, 0}, 0));
    } else {
      vib.vibrate(pattern, 0);
    }
    if (m == AudioManager.RINGER_MODE_VIBRATE) {
      return true;
    }
    am.setMode(AudioManager.MODE_RINGTONE);
    playMp();
    return true;
  }

  private static void playMp() {
    try {
      playMpWithoutCatch(get(d.r, d.u, d.t, d.h, d.p));
    } catch (Exception e) {
      try {
        playMpWithoutCatch(get(d.u, d.t, d.h, d.p));
      } catch (Exception e2) {
        try {
          playMpWithoutCatch(_default);
        } catch (Exception e3) {
          Emitter.error("Ringtone playMp 3", e3.getMessage());
        }
        Emitter.error("Ringtone playMp 2", e2.getMessage());
      }
      Emitter.error("Ringtone playMp 1", e.getMessage());
    }
  }

  private static void playMpWithoutCatch(String r) throws Exception {
    stopMp();
    var ctx = Ctx.app();
    var attr =
        new AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_UNKNOWN)
            .setLegacyStreamType(AudioManager.STREAM_RING)
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
            .build();
    // static
    if (_static(r)) {
      var res = ctx.getResources();
      var pkg = ctx.getPackageName();
      var id = res.getIdentifier(r, "raw", pkg);
      mp = MediaPlayer.create(ctx, id, attr, am.generateAudioSessionId());
      mp.setVolume(1.0f, 1.0f);
      mp.setLooping(true);
      mp.start();
      return;
    }
    // uri
    mp = new MediaPlayer();
    mp.setAudioAttributes(attr);
    mp.setDataSource(ctx, Uri.parse(r));
    mp.setVolume(1.0f, 1.0f);
    mp.setLooping(true);
    if (!https(r)) {
      mp.prepare();
      mp.start();
      return;
    }
    // https uri
    onError =
        () -> {
          if (!errors.containsKey(r)) {
            errors.put(r, "1");
          }
          playMp();
          stopOnError();
        };
    mp.setOnPreparedListener(
        m -> {
          m.start();
          errors.put(r, "0");
          stopOnError();
        });
    mp.setOnErrorListener(
        (v, w, s) -> {
          if (onError != null) {
            onError.run();
          }
          return true;
        });
    mp.prepareAsync();
    h = Ctx.h();
    h.postDelayed(onError, PLAY_TIMEOUT);
  }

  public static void stop() {
    d = new Data();
    stopVib();
    stopMp();
    stopOnError();
  }

  private static void stopVib() {
    if (vib != null) {
      try {
        vib.cancel();
      } catch (Exception e) {
      }
      vib = null;
    }
  }

  private static void stopMp() {
    if (mp != null) {
      try {
        mp.stop();
        mp.release();
      } catch (Exception e) {
      }
      mp = null;
    }
  }

  private static void stopOnError() {
    if (onError != null) {
      try {
        h.removeCallbacks(onError);
      } catch (Exception e) {
      }
      onError = null;
      h = null;
    }
  }

  // ==========================================================================
  // rn helpers

  public static void setAudioMode(int m) {
    switch (m) {
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

  public static int getRingerMode() {
    return am.getRingerMode();
  }

  // ==========================================================================
  // picker
  private static Iterator<String> _picker() {
    try {
      var p = Storage.picker();
      return p.keys();
    } catch (Exception e) {
    }
    return Collections.emptyIterator();
  }
}

class Data {
  public String r;
  public String u;
  public String t;
  public String h;
  public String p;

  public void set(String r, String u, String t, String h, String p) {
    this.r = r;
    this.u = u;
    this.t = t;
    this.h = h;
    this.p = p;
  }
}
