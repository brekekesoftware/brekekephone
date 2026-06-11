package com.brekeke.phonedev.utils

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.VibrationEffect
import android.os.Vibrator
import android.text.TextUtils
import android.util.Log
import android.util.Pair
import com.brekeke.phonedev.BrekekeUtils
import com.facebook.react.bridge.NativeArray
import com.facebook.react.bridge.WritableNativeArray
import java.io.File
import java.util.Arrays
import java.util.Collections
import java.util.Spliterators
import java.util.stream.Stream
import java.util.stream.StreamSupport

// utils to handle ringtone
// see the related part in rn js for reference

object Ringtone {
  val TAG = "[Ringtone]"

  @Volatile var shouldSkipPlayRingtone = false

  private var am: AudioManager? = null

  fun init() {
    if (am != null) return
    val ctx = Ctx.app()!!
    am = ctx.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    debug()
  }

  private fun debug() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
    val l1 = AudioManager.OnModeChangedListener { m ->
      val k1 = "onModeChanged:mode::"
      val k2 = "${k1}AudioManager."
      when (m) {
        AudioManager.MODE_NORMAL -> Emitter.debug("${k2}MODE_NORMAL")
        AudioManager.MODE_INVALID -> Emitter.debug("${k2}MODE_INVALID")
        AudioManager.MODE_CURRENT -> Emitter.debug("${k2}MODE_CURRENT")
        AudioManager.MODE_RINGTONE -> Emitter.debug("${k2}MODE_RINGTONE")
        AudioManager.MODE_IN_CALL -> Emitter.debug("${k2}MODE_IN_CALL")
        AudioManager.MODE_IN_COMMUNICATION -> Emitter.debug("${k2}MODE_IN_COMMUNICATION")
        AudioManager.MODE_CALL_SCREENING -> Emitter.debug("${k2}MODE_CALL_SCREENING")
        else -> Emitter.debug(k1 + m)
      }
    }
    val l2 = AudioManager.OnCommunicationDeviceChangedListener { device: AudioDeviceInfo? ->
      if (device == null) {
        Emitter.debug("onCommunicationDeviceChanged:AudioDeviceInfo::null")
        return@OnCommunicationDeviceChangedListener
      }
      Emitter.debug(
          "onCommunicationDeviceChanged:AudioDeviceInfo::${device.type}::${device.productName}"
      )
    }
    val ctx = Ctx.app()!!
    val e = ctx.mainExecutor
    am!!.addOnModeChangedListener(e, l1)
    am!!.addOnCommunicationDeviceChangedListener(e, l2)
  }

  fun options(): NativeArray {
    val arr = WritableNativeArray()
    for (r in _static) arr.pushString(r)
    val pp = _picker()
    while (pp.hasNext()) arr.pushString(pp.next())
    system().use { s -> s.forEach { p -> arr.pushString(p.first) } }
    return arr
  }

  private fun system(): Stream<Pair<String, String>> {
    val ctx = Ctx.app()!!
    val rm = RingtoneManager(ctx)
    rm.setType(RingtoneManager.TYPE_RINGTONE)
    val c = rm.cursor
    val iterator =
        object : Iterator<Pair<String, String>> {
          override fun hasNext() = c.moveToNext()

          override fun next(): Pair<String, String> {
            val title = c.getString(RingtoneManager.TITLE_COLUMN_INDEX)
            val uri = rm.getRingtoneUri(c.position).toString()
            return Pair(title, uri)
          }
        }
    val spliterator = Spliterators.spliteratorUnknownSize(iterator, 0)
    return StreamSupport.stream(spliterator, false).onClose { c.close() }
  }

  private val _static = arrayOf("incallmanager_ringtone")
  val _default = _static[0]
  private val defaultFormat = ".mp3"
  private val errors: MutableMap<String, String> = HashMap()

  private fun validate(r: String?): String? {
    if (TextUtils.isEmpty(r)) return null
    if (_systemDefault(r!!)) {
      val u = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
      return u.toString()
    }
    if (_static(r)) return r
    if (https(r)) return r
    val pp = pickerPath(r)
    if (pp.isNotEmpty()) return pp
    system().use { s ->
      return s.filter { p -> p.first == r }.map { p -> p.second }.findFirst().orElse(null)
    }
  }

  private fun validateWithError(r: String?): String? {
    val v = validate(r) ?: return null
    if ("1" == errors[v]) return null
    return v
  }

  private fun _static(r: String) = Arrays.asList(*_static).contains(r)

  private fun _systemDefault(r: String) = "--" == r

  private fun https(r: String) = r.startsWith("https://")

  private fun pickerPath(filename: String): String {
    val ctx = Ctx.app()!!
    val file = File(ctx.filesDir, "Ringtones")
    val des = File(file, filename + defaultFormat)
    if (!des.exists()) return ""
    return des.absolutePath
  }

  fun get(r: String?, u: String?, t: String?, h: String?, p: String?): String {
    return try {
      val v = validateWithError(r)
      if (!TextUtils.isEmpty(v)) return v!!
      get(u, t, h, p)
    } catch (_: Exception) {
      _default
    }
  }

  private fun get(u: String?, t: String?, h: String?, p: String?): String {
    return try {
      val a = Account.find(u, t, h, p)!!
      var r = validateWithError(a.getString("ringtone"))
      if (!TextUtils.isEmpty(r)) return r!!
      r = validateWithError(a.getString("pbxRingtone"))
      if (!TextUtils.isEmpty(r)) return r!!
      _default
    } catch (_: Exception) {
      _default
    }
  }

  private var vib: Vibrator? = null
  private var mp: MediaPlayer? = null
  private const val PLAY_TIMEOUT = 1000L
  private var onError: Runnable? = null
  private var handler: Handler? = null
  private var d = Data()

  fun play(r: String?, u: String?, t: String?, h: String?, p: String?): Boolean {
    if (BrekekeUtils.anyCallAnswered()) {
      Emitter.debug("[Ringtone] Skip playing: another call is already answered.")
      return false
    }
    Log.d(TAG, "play: shouldSkipPlayRingtone = $shouldSkipPlayRingtone")
    if (shouldSkipPlayRingtone) {
      Emitter.debug("[Ringtone] Skip playing: a call is already connected.")
      return false
    }
    if (mp != null) {
      Emitter.debug("[Ringtone] Ringtone is playing")
      return false
    }
    d.set(r, u, t, h, p)
    val m = am!!.ringerMode
    if (m == AudioManager.RINGER_MODE_SILENT) return true
    val ctx = Ctx.app()!!
    if (vib == null) vib = ctx.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    val pattern = longArrayOf(0, 1000, 1000)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      vib!!.vibrate(VibrationEffect.createWaveform(pattern, intArrayOf(0, 255, 0), 0))
    } else {
      @Suppress("DEPRECATION") vib!!.vibrate(pattern, 0)
    }
    if (m == AudioManager.RINGER_MODE_VIBRATE) return true
    am!!.mode = AudioManager.MODE_RINGTONE
    playMp()
    return true
  }

  private fun playMp() {
    try {
      playMpWithoutCatch(get(d.r, d.u, d.t, d.h, d.p))
    } catch (e: Exception) {
      try {
        playMpWithoutCatch(get(d.u, d.t, d.h, d.p))
      } catch (e2: Exception) {
        try {
          playMpWithoutCatch(_default)
        } catch (e3: Exception) {
          Emitter.error("Ringtone playMp 3", e3.message)
        }
        Emitter.error("Ringtone playMp 2", e2.message)
      }
      Emitter.error("Ringtone playMp 1", e.message)
    }
  }

  @Throws(Exception::class)
  private fun playMpWithoutCatch(r: String) {
    stopMp()
    val ctx = Ctx.app()!!
    val attr =
        AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_UNKNOWN)
            .setLegacyStreamType(AudioManager.STREAM_RING)
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
            .build()
    if (_static(r)) {
      val res = ctx.resources
      val pkg = ctx.packageName
      val id = res.getIdentifier(r, "raw", pkg)
      mp = MediaPlayer.create(ctx, id, attr, am!!.generateAudioSessionId())
      mp!!.setVolume(1.0f, 1.0f)
      mp!!.isLooping = true
      mp!!.start()
      return
    }
    mp = MediaPlayer()
    mp!!.setAudioAttributes(attr)
    mp!!.setDataSource(ctx, Uri.parse(r))
    mp!!.setVolume(1.0f, 1.0f)
    mp!!.isLooping = true
    if (!https(r)) {
      mp!!.prepare()
      mp!!.start()
      return
    }
    onError = Runnable {
      if (!errors.containsKey(r)) errors[r] = "1"
      playMp()
      stopOnError()
    }
    mp!!.setOnPreparedListener { m ->
      m.start()
      errors[r] = "0"
      stopOnError()
    }
    mp!!.setOnErrorListener { _, _, _ ->
      onError?.run()
      true
    }
    mp!!.prepareAsync()
    handler = Ctx.h()
    handler!!.postDelayed(onError!!, PLAY_TIMEOUT)
  }

  fun stop() {
    d = Data()
    stopVib()
    stopMp()
    stopOnError()
  }

  private fun stopVib() {
    vib?.let {
      try {
        it.cancel()
      } catch (_: Exception) {}
      vib = null
    }
  }

  private fun stopMp() {
    mp?.let {
      try {
        it.stop()
        it.release()
      } catch (_: Exception) {}
      mp = null
    }
  }

  private fun stopOnError() {
    onError?.let {
      try {
        handler!!.removeCallbacks(it)
      } catch (_: Exception) {}
      onError = null
      handler = null
    }
  }

  fun setAudioMode(m: Int) {
    when (m) {
      AudioManager.MODE_NORMAL -> am!!.mode = AudioManager.MODE_NORMAL
      AudioManager.MODE_RINGTONE -> am!!.mode = AudioManager.MODE_RINGTONE
      AudioManager.MODE_IN_CALL -> am!!.mode = AudioManager.MODE_IN_CALL
      AudioManager.MODE_IN_COMMUNICATION -> am!!.mode = AudioManager.MODE_IN_COMMUNICATION
      AudioManager.MODE_CALL_SCREENING -> am!!.mode = AudioManager.MODE_CALL_SCREENING
      else -> am!!.mode = AudioManager.MODE_NORMAL
    }
  }

  fun getRingerMode(): Int = am!!.ringerMode

  private fun _picker(): Iterator<String> {
    return try {
      val p = Storage.picker()
      p.keys()
    } catch (_: Exception) {
      Collections.emptyIterator()
    }
  }
}

class Data {
  var r: String? = null
  var u: String? = null
  var t: String? = null
  var h: String? = null
  var p: String? = null

  fun set(r: String?, u: String?, t: String?, h: String?, p: String?) {
    this.r = r
    this.u = u
    this.t = t
    this.h = h
    this.p = p
  }
}
