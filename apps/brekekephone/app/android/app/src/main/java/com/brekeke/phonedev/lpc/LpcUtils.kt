package com.brekeke.phonedev.lpc

import android.annotation.SuppressLint
import android.app.ActivityManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import android.text.TextUtils
import android.util.Base64
import android.util.Log
import com.brekeke.phonedev.utils.Emitter
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import java.io.BufferedReader
import java.io.FileNotFoundException
import java.io.IOException
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.security.NoSuchAlgorithmException
import java.security.cert.CertificateException
import java.security.cert.X509Certificate
import java.util.Arrays
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager
import org.json.JSONObject

object LpcUtils {
  const val TAG = "[BrekekeLpcService]"
  const val NOTI_CHANNEL_ID = "NOTIFICATION_CHANNEL"
  const val NOTI_ID = 0

  fun putConfigToIntent(
      host: String?,
      port: Int,
      token: String?,
      userName: String?,
      tlsKeyHash: String?,
      remoteSsids: ArrayList<String>?,
      i: Intent,
  ): Intent {
    i.putExtra("token", token)
    i.putExtra("username", userName)
    i.putExtra("host", host)
    i.putExtra("port", port)
    i.putExtra("tlsKeyHash", tlsKeyHash)
    i.putStringArrayListExtra("remoteSsids", remoteSsids)
    return i
  }

  fun createReactContextInBackground(r: ReactApplication) {
    // bridgeless: the legacy ReactInstanceManager path would spin up a second
    // js runtime besides the one ReactHost owns; start() is idempotent
    r.reactHost?.start()
  }

  fun checkAppInBackground(): Boolean {
    if (!BrekekeLpcService.isServiceStarted) return false
    val myProcess = ActivityManager.RunningAppProcessInfo()
    ActivityManager.getMyMemoryState(myProcess)
    return myProcess.importance != ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
  }

  val connection: ServiceConnection =
      object : ServiceConnection {
        override fun onServiceConnected(className: ComponentName, service: IBinder) {}

        override fun onServiceDisconnected(arg0: ComponentName) {}
      }

  fun convertMapToString(m: Map<String, String>): String = JSONObject(m).toString()

  object LpcCallback {
    var cb: CallbackInterface? = null

    interface CallbackInterface {
      fun getStateServer(b: Boolean)
    }

    fun setLpcCallback(c: CallbackInterface) {
      cb = c
    }
  }

  fun isMIUI(): Boolean = !TextUtils.isEmpty(getSystemProperty("ro.miui.ui.version.name"))

  @SuppressLint("PrivateApi")
  private fun getSystemProperty(key: String): String? {
    return try {
      val p = Class.forName("android.os.SystemProperties")
      p.getMethod("get", String::class.java).invoke(null, key) as? String
    } catch (_: Exception) {
      null
    }
  }

  fun getPermissionManagerIntent(ctx: Context): Intent {
    val i = Intent("miui.intent.action.APP_PERM_EDITOR")
    i.putExtra("extra_package_uid", android.os.Process.myUid())
    i.putExtra("extra_pkgname", ctx.packageName)
    i.putExtra("extra_package_name", ctx.packageName)
    return i
  }

  const val fileName = "BrekekeConfig"

  fun writeConfig(context: Context, content: String) {
    try {
      context.openFileOutput(fileName, Context.MODE_PRIVATE).use { fos ->
        fos.write(content.toByteArray())
      }
    } catch (e: IOException) {
      throw RuntimeException(e)
    }
  }

  @Throws(FileNotFoundException::class)
  fun readConfig(context: Context): String {
    val fis = context.openFileInput(fileName)
    val inputStreamReader = InputStreamReader(fis, StandardCharsets.UTF_8)
    val stringBuilder = StringBuilder()
    try {
      BufferedReader(inputStreamReader).use { reader ->
        var line = reader.readLine()
        while (line != null) {
          stringBuilder.append(line).append('\n')
          line = reader.readLine()
        }
        return stringBuilder.toString()
      }
    } catch (e: IOException) {
      Log.d(TAG, "readConfig: " + e.message)
    }
    return ""
  }

  @Throws(Exception::class)
  fun createTrustedSSLContext(sha256Fingerprint: String?, mContext: Context): SSLContext {
    val sslContext = SSLContext.getInstance("TLS")
    val trustManagers =
        arrayOf<TrustManager>(
            object : X509TrustManager {
              override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {}

              @Throws(CertificateException::class)
              override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {
                if (sha256Fingerprint.isNullOrEmpty()) {
                  Emitter.debug("[LpcUtils] checkServerTrusted: empty configured hash, skip")
                  return
                }
                if (chain.isEmpty()) {
                  Emitter.error("[LpcUtils] checkServerTrusted: empty certificate chain")
                  throw CertificateException("Empty certificate chain")
                }
                try {
                  val certDer = chain[0].encoded
                  val spki =
                      extractSPKI(certDer)
                          ?: run {
                            Emitter.error(
                                "[LpcUtils] checkServerTrusted: extractSPKI returned null (DER parse failed), certLen=${certDer.size}"
                            )
                            throw CertificateException("Failed to extract SPKI from certificate")
                          }
                  val hash = MessageDigest.getInstance("SHA-256").digest(spki)
                  val fingerprint = Base64.encodeToString(hash, Base64.NO_WRAP)
                  if (fingerprint != sha256Fingerprint) {
                    Emitter.error(
                        "[LpcUtils] checkServerTrusted: fingerprint mismatch computed=$fingerprint expected=$sha256Fingerprint"
                    )
                    throw CertificateException("Certificate fingerprint does not match")
                  }
                  Emitter.debug("[LpcUtils] checkServerTrusted: fingerprint match $fingerprint")
                } catch (e: NoSuchAlgorithmException) {
                  Emitter.error("[LpcUtils] checkServerTrusted: SHA-256 not available")
                  throw CertificateException("SHA-256 not available", e)
                }
              }

              override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
            }
        )
    sslContext.init(null, trustManagers, null)
    return sslContext
  }

  private fun extractSPKI(der: ByteArray): ByteArray? {
    val i = intArrayOf(0)
    if (!enterSequence(der, i)) return null
    if (!enterSequence(der, i)) return null
    if (i[0] < der.size && (der[i[0]].toInt() and 0xFF) == 0xA0) {
      if (!skipTLV(der, i)) return null
    }
    if (!skipTLV(der, i)) return null
    if (!skipTLV(der, i)) return null
    if (!skipTLV(der, i)) return null
    if (!skipTLV(der, i)) return null
    if (!skipTLV(der, i)) return null
    val spkiStart = i[0]
    if (i[0] >= der.size || (der[i[0]].toInt() and 0xFF) != 0x30) return null
    i[0]++
    val spkiLen = readLength(der, i)
    if (spkiLen < 0) return null
    val spkiEnd = i[0] + spkiLen
    if (spkiEnd > der.size) return null
    return Arrays.copyOfRange(der, spkiStart, spkiEnd)
  }

  private fun enterSequence(der: ByteArray, i: IntArray): Boolean {
    if (i[0] >= der.size || (der[i[0]].toInt() and 0xFF) != 0x30) return false
    i[0]++
    return readLength(der, i) >= 0
  }

  private fun skipTLV(der: ByteArray, i: IntArray): Boolean {
    if (i[0] >= der.size) return false
    i[0]++
    val len = readLength(der, i)
    if (len < 0) return false
    i[0] += len
    return i[0] <= der.size
  }

  private fun readLength(der: ByteArray, i: IntArray): Int {
    if (i[0] >= der.size) return -1
    val first = der[i[0]++].toInt() and 0xFF
    if ((first and 0x80) == 0) return first
    val n = first and 0x7F
    if (n == 0 || n > 4 || i[0] + n > der.size) return -1
    var len = 0
    for (k in 0 until n) len = (len shl 8) or (der[i[0]++].toInt() and 0xFF)
    return len
  }

  fun convertReadableArrayToStringList(array: ReadableArray?): ArrayList<String> {
    val result = ArrayList<String>()
    if (array == null || array.size() == 0) return result
    for (i in 0 until array.size()) {
      try {
        val value: String? =
            if (array.getType(i) == ReadableType.String) {
              array.getString(i)
            } else {
              array.getDynamic(i).asString()
            }
        if (value != null && value != "null") result.add(value)
      } catch (_: Exception) {}
    }
    return result
  }
}
