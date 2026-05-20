package com.brekeke.phonedev.lpc

import android.content.Context
import android.os.AsyncTask
import android.os.NetworkOnMainThreadException
import android.util.Base64
import android.util.Log
import com.brekeke.phonedev.BrekekeUtils
import com.brekeke.phonedev.utils.Ctx
import com.brekeke.phonedev.utils.Emitter
import com.brekeke.phonedev.utils.NotificationHelper
import com.google.gson.Gson
import java.io.IOException
import java.net.InetSocketAddress
import java.net.StandardSocketOptions.SO_KEEPALIVE
import java.net.StandardSocketOptions.TCP_NODELAY
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.channels.SelectionKey
import java.nio.channels.Selector
import java.nio.channels.SocketChannel
import java.nio.charset.Charset
import java.nio.charset.StandardCharsets
import java.security.GeneralSecurityException
import java.security.KeyManagementException
import java.security.NoSuchAlgorithmException
import java.util.HashMap
import java.util.Random
import javax.net.ssl.SSLContext
import org.json.JSONObject
import tlschannel.ClientTlsChannel
import tlschannel.NeedsReadException
import tlschannel.NeedsWriteException

class BrekekeLpcSocket {

  inner class SSLSocketAsyncTask(private val mContext: Context) :
      AsyncTask<LpcModel.Settings, Void, String>() {
    private var requestSent = false
    private lateinit var settings: LpcModel.Settings
    private val utf8: Charset = StandardCharsets.UTF_8
    private val gson = Gson()

    inner class CodableHelper {
      fun <T> encode(obj: T): String = gson.toJson(obj)

      fun <T> decode(json: String, type: Class<T>): T = gson.fromJson(json, type)
    }

    inner class Person(val deviceName: String, val uuid: String)

    inner class Payload(data: Any) {
      val codingKey: Int = 1
      val data: String =
          String(
              Base64.encode(
                  CodableHelper().encode(data).toByteArray(StandardCharsets.UTF_8),
                  Base64.NO_WRAP,
              )
          )
    }

    inner class Wrapper(val payload: Payload) {
      val requestIdentifier: String = ""
      val command: String = "request"
    }

    override fun doInBackground(vararg params: LpcModel.Settings): String {
      Log.d(LpcUtils.TAG, "BrekekeLpcSocket.doInBackground: ${params[0]}")
      this.settings = params[0]
      this.handleCallToServer()
      return ""
    }

    override fun onCancelled() {
      Log.d(LpcUtils.TAG, "BrekekeLpcSocket.onCancelled")
    }

    override fun onPostExecute(result: String) {
      Log.d(LpcUtils.TAG, "BrekekeLpcSocket.onPostExecute")
      BrekekeLpcService.con!!.onDisconnected()
    }

    private fun handleCallToServer() {
      Emitter.debug(
          "[BrekekeLpcSocket] connecting host=${settings.host} port=${settings.port} tlsKeyHash=${settings.tlsKeyHash}"
      )
      try {
        val sslContext = LpcUtils.createTrustedSSLContext(settings.tlsKeyHash, mContext)
        createChannel(sslContext)
      } catch (e: NoSuchAlgorithmException) {
        Log.d(LpcUtils.TAG, "NoSuchAlgorithmException: ${e.message}")
        Emitter.error("[BrekekeLpcSocket] NoSuchAlgorithmException: ${e.message}")
      } catch (e: KeyManagementException) {
        Log.d(LpcUtils.TAG, "KeyManagementException: ${e.message}")
        Emitter.error("[BrekekeLpcSocket] KeyManagementException: ${e.message}")
      } catch (e: NetworkOnMainThreadException) {
        Log.d(LpcUtils.TAG, "NetworkOnMainThreadException: ${e.message}")
        Emitter.error("[BrekekeLpcSocket] GeneralSecurityException: ${e.message}")
      } catch (e: GeneralSecurityException) {
        Log.d(LpcUtils.TAG, "GeneralSecurityException: ${e.message}")
        Emitter.error("[BrekekeLpcSocket] GeneralSecurityException: ${e.message}")
      } catch (e: IOException) {
        Log.d(LpcUtils.TAG, "IOException: ${e.message}")
        if (e.message == "Connection refused") {
          LpcUtils.LpcCallback.cb!!.getStateServer(false)
          Emitter.error("[BrekekeLpcSocket] Connection refused")
        } else {
          Emitter.error("[BrekekeLpcSocket] IOException: ${e.message}")
        }
      } catch (e: Exception) {
        Log.d(LpcUtils.TAG, "Exception: ${e.message}")
        Emitter.error("[BrekekeLpcSocket] Exception: ${e::class.java.simpleName}: ${e.message}")
      }
    }

    @Throws(IOException::class, GeneralSecurityException::class)
    fun createChannel(sslContext: SSLContext) {
      var requestBuffer: ByteBuffer? = null
      val responseBuffer = ByteBuffer.allocateDirect(8096)
      val selector = Selector.open()
      var isConnected = false
      SocketChannel.open().use { rawChannel ->
        rawChannel.configureBlocking(false)
        rawChannel.setOption(SO_KEEPALIVE, true)
        rawChannel.setOption(TCP_NODELAY, true)
        rawChannel.connect(InetSocketAddress(settings.host, settings.port))
        rawChannel.register(selector, SelectionKey.OP_CONNECT)
        val builder = ClientTlsChannel.newBuilder(rawChannel, sslContext)
        builder.build().use { tlsChannel ->
          mainloop@ while (true) {
            selector.select()
            val iterator = selector.selectedKeys().iterator()
            while (iterator.hasNext()) {
              val key = iterator.next()
              iterator.remove()
              when {
                key.isConnectable -> {
                  if (rawChannel.finishConnect()) {
                    rawChannel.register(selector, SelectionKey.OP_WRITE)
                  }
                }
                key.isReadable || key.isWritable -> {
                  try {
                    if (!BrekekeLpcService.isServiceStarted) {
                      rawChannel.shutdownInput()
                      rawChannel.shutdownOutput()
                      rawChannel.close()
                      break@mainloop
                    }
                    if (!requestSent) {
                      requestBuffer?.let { if (it.hasRemaining()) it.clear() }
                      val data = if (isConnected) getAcknowledeParams() else getDataParams()
                      requestBuffer = ByteBuffer.wrap(data, 0, data.size)
                      tlsChannel.write(requestBuffer)
                      if (requestBuffer!!.remaining() == 0) {
                        requestSent = true
                        isConnected = true
                      }
                    } else {
                      responseBuffer.clear()
                      val c = tlsChannel.read(responseBuffer)
                      if (c > 0) {
                        responseBuffer.flip()
                        handleResponse(responseBuffer)
                        Thread.sleep(1000)
                      } else {
                        tlsChannel.close()
                        break@mainloop
                      }
                    }
                  } catch (e: NeedsReadException) {
                    key.interestOps(SelectionKey.OP_READ)
                  } catch (e: NeedsWriteException) {
                    key.interestOps(SelectionKey.OP_WRITE)
                  } catch (e: InterruptedException) {
                    throw RuntimeException(e)
                  }
                }
                else -> throw IllegalStateException()
              }
            }
          }
        }
      }
    }

    private fun handleResponse(responseBuffer: ByteBuffer) {
      val json = utf8.decode(responseBuffer).toString().substring(4)
      val wr = CodableHelper().decode(json, Wrapper::class.java)
      try {
        if (wr.command == "request") {
          requestSent = false
          if (wr.payload.codingKey == 3) {
            val res = String(decodeLpcPayloadBase64(wr.payload.data))
            Log.d(LpcUtils.TAG, "handleResponse: $res")
            val obj = JSONObject(res)
            @Suppress("UNCHECKED_CAST")
            val m: MutableMap<String, String> =
                gson.fromJson(obj.getString("custom"), Map::class.java)
                    as MutableMap<String, String>
            if (isChatMessage(m)) {
              handleChatmessageResponse(obj, m)
            } else {
              handleLPCResponse(m)
            }
            Emitter.debug("[BrekekeLpcSocket] Response $res")
          }
          BrekekeLpcService.con!!.onMessageReceived()
        }
      } catch (e: Exception) {
        Log.d(LpcUtils.TAG, "handleResponse error: ${e.message}")
        Emitter.error("[BrekekeLpcSocket] handleResponse ${e.message}")
      }
    }

    /**
     * Decode LPC payload base64 with fallback across Base64 variants. PBX server versions differ in
     * which alphabet they emit (current Brekeke PBX uses URL-safe '-'/'_'; future versions may
     * switch to standard '+'/'/'), and historical clients shipped a strict standard decoder that
     * fails on URL-safe input (BUG-1222). Try variants in popularity order so any encoding the
     * server sends decodes successfully.
     */
    private fun decodeLpcPayloadBase64(pd: String): ByteArray {
      // 1. Standard alphabet, no wrap — most common default in network APIs.
      try {
        return Base64.decode(pd, Base64.NO_WRAP)
      } catch (_: IllegalArgumentException) {}
      // 2. URL-safe alphabet — current Brekeke PBX uses this.
      try {
        return Base64.decode(pd, Base64.URL_SAFE or Base64.NO_WRAP)
      } catch (_: IllegalArgumentException) {}
      // 3. MIME decoder (skips unknown chars + accepts line wrapping) — last resort.
      try {
        return java.util.Base64.getMimeDecoder().decode(pd)
      } catch (_: IllegalArgumentException) {}
      Emitter.error("[BrekekeLpcSocket] Cannot decode LPC payload base64 with any known variant")
      return ByteArray(0)
    }

    private fun addSizeToMessage(message: String): ByteArray {
      val jsonBytes = message.toByteArray(StandardCharsets.UTF_8)
      val lengthBuffer = ByteBuffer.allocate(4).order(ByteOrder.LITTLE_ENDIAN)
      lengthBuffer.putInt(jsonBytes.size)
      val buffer = ByteBuffer.allocate(4 + jsonBytes.size).order(ByteOrder.LITTLE_ENDIAN)
      buffer.put(lengthBuffer.array())
      buffer.put(jsonBytes)
      return buffer.array()
    }

    @Throws(IOException::class)
    private fun getDataParams(): ByteArray {
      val map: MutableMap<String, Any> = HashMap()
      map["requestIdentifier"] = Random().nextInt(999999999)
      val u = LpcModel().User(settings.token!!, settings.token!!, settings.userName!!)
      map["payload"] = Payload(u)
      map["command"] = "request"
      return addSizeToMessage(CodableHelper().encode(map))
    }

    @Throws(IOException::class)
    private fun getAcknowledeParams(): ByteArray {
      val map: MutableMap<String, Any> = HashMap()
      map["requestIdentifier"] = Random().nextInt(999999999)
      map["command"] = "acknowledge"
      return addSizeToMessage(CodableHelper().encode(map))
    }

    private fun isChatMessage(m: Map<String, String>): Boolean =
        m["x_pn-id"] == null && "message".equals(m["event"], ignoreCase = true)

    private fun handleChatmessageResponse(obj: JSONObject, m: MutableMap<String, String>) {
      try {
        var msg = obj.getString("message")
        val title = m.getOrDefault("senderUserName", m.getOrDefault("senderUserId", ""))
        if (msg.isEmpty()) msg = "UC message"
        m["body"] = msg
        if (!title.isNullOrEmpty()) {
          m["title"] = title
          val lc = "local_notification"
          m["my_custom_data"] = lc
          m["is_local_notification"] = lc
        }
        val e = LpcUtils.convertMapToString(m)
        if (!Emitter.emit("lpcPnMessage", e)) {
          NotificationHelper.showLocalPush(mContext, title, msg, m)
        }
        Emitter.debug("[BrekekeLpcSocket] Show local push from Lpc ")
      } catch (e: Exception) {
        Log.d(LpcUtils.TAG, "handleChat messageResponse error: ${e.message}")
        Emitter.error("[BrekekeLpcSocket] handleChat messageResponse error ${e.message}")
      }
    }

    private fun handleLPCResponse(m: MutableMap<String, String>) {
      m["lpc"] = "true"
      Ctx.wakeFromPn(mContext)
      BrekekeUtils.onFcmMessageReceived(m)
      val e = LpcUtils.convertMapToString(m)
      Emitter.emit("lpcPnMessage", e)
      Log.d(LpcUtils.TAG, "Incoming call started by Lpc")
      Emitter.debug("[BrekekeLpcSocket] Incoming call started by Lpc")
    }
  }
}
