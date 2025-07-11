package com.brekeke.phonedev.utils;

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
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.text.TextUtils;
import android.util.Pair;
import com.facebook.react.bridge.NativeArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import java.util.Arrays;
import java.util.Iterator;
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
      arr.pushMap(option(r, r));
    }
    try (var s = system()) {
      s.forEach(p -> arr.pushMap(option(p.first, p.second)));
    }
    return arr;
  }

  private static WritableMap option(String title, String uri) {
    var m = new WritableNativeMap();
    m.putString("title", title);
    m.putString("uri", uri);
    return m;
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

    Spliterator<Pair<String, String>> spliterator =
        Spliterators.spliteratorUnknownSize(iterator, 0);
    return StreamSupport.stream(spliterator, false).onClose(c::close);
  }

  // ==========================================================================
  // validate

  private static final String[] _static = {"incallmanager_ringtone"};
  private static final String _default = _static[0];

  public static String validate(String r) {
    var v = _validate(r);
    return TextUtils.isEmpty(v) ? _default : v;
  }

  private static String _validate(String r) {
    if (TextUtils.isEmpty(r)) {
      return null;
    }
    if (_static(r)) {
      return r;
    }
    try (var s = system()) {
      return s.filter(p -> p.first.equals(r) || p.second.equals(r))
          .map(p -> p.second)
          .findFirst()
          .orElse(null);
    }
  }

  private static boolean _static(String r) {
    return Arrays.asList(_static).contains(r);
  }

  // get from push notification and validate
  public static String get(String r, String u, String t, String h, String p) {
    try {
      if (!TextUtils.isEmpty(r)) {
        return validate(r);
      }
      return get(u, t, h, p);
    } catch (Exception e) {
    }
    return _default;
  }

  // get from account and validate
  public static String get(String u, String t, String h, String p) {
    try {
      var a = Account.find(u, t, h, p);
      var r = _validate(a.getString("ringtoneUri"));
      if (r != null) {
        return r;
      }
      r = _validate(a.getString("ringtone"));
      if (r != null) {
        return r;
      }
      r = _validate(a.getString("pbxRingtone"));
      if (r != null) {
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

  public static void play(String r) {
    if (mp != null) {
      return;
    }
    int m = am.getRingerMode();
    if (m == AudioManager.RINGER_MODE_SILENT) {
      return;
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
      return;
    }
    am.setMode(AudioManager.MODE_RINGTONE);
    try {
      _play(r);
    } catch (Exception e) {
      try {
        _play(_default);
      } catch (Exception e2) {
        Emitter.error("Ringtone play2", e2.getMessage());
      }
      Emitter.error("Ringtone play", e.getMessage());
    }
  }

  private static void _play(String r) throws Exception {
    var ctx = Ctx.app();
    var attr =
        new AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_UNKNOWN)
            .setLegacyStreamType(AudioManager.STREAM_RING)
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
            .build();
    if (_static(r)) {
      var res = ctx.getResources();
      var pkg = ctx.getPackageName();
      var id = res.getIdentifier(r, "raw", pkg);
      mp = MediaPlayer.create(ctx, id, attr, am.generateAudioSessionId());
    } else {
      mp = new MediaPlayer();
      mp.setAudioAttributes(attr);
      mp.setDataSource(ctx, Uri.parse(r));
      mp.prepare();
    }
    mp.setVolume(1.0f, 1.0f);
    mp.setLooping(true);
    mp.start();
  }

  public static void stop() {
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
}
