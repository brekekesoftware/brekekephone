package com.brekeke.phonedev.lpc;

import static java.net.StandardSocketOptions.SO_KEEPALIVE;
import static java.net.StandardSocketOptions.TCP_NODELAY;

import android.content.Context;
import android.os.AsyncTask;
import android.os.NetworkOnMainThreadException;
import android.util.Base64;
import android.util.Log;
import com.brekeke.phonedev.BrekekeUtils;
import com.brekeke.phonedev.utils.Ctx;
import com.brekeke.phonedev.utils.Emitter;
import com.google.gson.Gson;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.SocketChannel;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import javax.net.ssl.SSLContext;
import org.json.JSONObject;
import tlschannel.ClientTlsChannel;
import tlschannel.NeedsReadException;
import tlschannel.NeedsWriteException;
import tlschannel.TlsChannel;

public class BrekekeLpcSocket {
  public class SSLSocketAsyncTask extends AsyncTask<LpcModel.Settings, Void, String> {
    private Context mContext;
    private boolean requestSent = false;
    private LpcModel.Settings settings;
    private Charset utf8 = StandardCharsets.UTF_8;

    public SSLSocketAsyncTask(Context context) {
      mContext = context;
    }

    public class CodableHelper {
      private final Gson gson = new Gson();

      public <T> String encode(T object) {
        return gson.toJson(object);
      }

      public <T> T decode(String json, Class<T> type) {
        return gson.fromJson(json, type);
      }
    }

    // to test with swift server running on local
    public class Person {
      private String deviceName;
      private String uuid;

      public Person(String message, String uuid) {
        this.deviceName = message;
        this.uuid = uuid;
      }
    }

    public class Payload {
      private Integer codingKey = 1;
      private String data;

      public Payload(Object data) {
        this.data =
            new String(
                Base64.encode(
                    (new CodableHelper().encode(data)).getBytes(StandardCharsets.UTF_8),
                    Base64.NO_WRAP));
      }
    }

    public class Wrapper {
      private String requestIdentifier = "";
      private String command = "request";
      private Payload payload;

      public Wrapper(Payload payload) {
        this.payload = payload;
      }
    }

    @Override
    protected String doInBackground(LpcModel.Settings... params) {
      Log.d(
          LpcUtils.TAG, "BrekekeLpcSocket.doInBackground: " + String.valueOf(params[0]).toString());
      this.settings = params[0];
      this.handleCallToServer();
      return "";
    }

    @Override
    protected void onCancelled() {
      Log.d(LpcUtils.TAG, "BrekekeLpcSocket.onCancelled");
    }

    @Override
    protected void onPostExecute(String result) {
      Log.d(LpcUtils.TAG, "BrekekeLpcSocket.onPostExecute");
    }

    private void handleCallToServer() {
      try {
        SSLContext sslContext =
            LpcUtils.createTrustedSSLContext(this.settings.tlsKeyHash, mContext);
        this.createChannel(sslContext);
      } catch (NoSuchAlgorithmException e) {
        Log.d(LpcUtils.TAG, "NoSuchAlgorithmException: " + e.getMessage());
      } catch (KeyManagementException e) {
        Log.d(LpcUtils.TAG, "KeyManagementException: " + e.getMessage());
      } catch (NetworkOnMainThreadException | GeneralSecurityException e) {
        Log.d(LpcUtils.TAG, "NetworkOnMainThreadException: " + e.getMessage());
      } catch (IOException e) {
        Log.d(LpcUtils.TAG, "IOException: " + e.getMessage());
        if (e.getMessage().equals("Connection refused")) {
          // stop service
          LpcUtils.LpcCallback.cb.getStateServer(false);
        }
      } catch (Exception e) {
        Log.d(LpcUtils.TAG, "Exception: " + e.getMessage());
      }
    }

    public void createChannel(SSLContext sslContext) throws IOException, GeneralSecurityException {
      ByteBuffer requestBuffer = null;
      ByteBuffer responseBuffer = ByteBuffer.allocateDirect(8096);
      Selector selector = Selector.open();
      try (SocketChannel rawChannel = SocketChannel.open()) {
        rawChannel.configureBlocking(false);
        rawChannel.setOption(SO_KEEPALIVE, true);
        rawChannel.setOption(TCP_NODELAY, true);
        rawChannel.connect(new InetSocketAddress(this.settings.host, this.settings.port));
        rawChannel.register(selector, SelectionKey.OP_CONNECT);
        ClientTlsChannel.Builder builder = ClientTlsChannel.newBuilder(rawChannel, sslContext);
        try (TlsChannel tlsChannel = builder.build()) {
          mainloop:
          while (true) {
            selector.select();
            Iterator<SelectionKey> iterator = selector.selectedKeys().iterator();
            while (iterator.hasNext()) {
              SelectionKey key = iterator.next();
              iterator.remove();
              if (key.isConnectable()) {
                if (rawChannel.finishConnect()) {
                  rawChannel.register(selector, SelectionKey.OP_WRITE);
                }
              } else if (key.isReadable() || key.isWritable()) {
                try {
                  if (!BrekekeLpcService.isServiceStarted) {
                    rawChannel.shutdownInput();
                    rawChannel.shutdownOutput();
                    rawChannel.close();
                    break mainloop;
                  }
                  if (!requestSent) {
                    if (requestBuffer != null && requestBuffer.hasRemaining()) {
                      requestBuffer.clear();
                    }
                    byte[] data = getDataParams();
                    requestBuffer = ByteBuffer.wrap(data, 0, data.length);
                    tlsChannel.write(requestBuffer);
                    if (requestBuffer.remaining() == 0) {
                      requestSent = true;
                    }
                  } else {
                    responseBuffer.clear();
                    int c = tlsChannel.read(responseBuffer);
                    if (c > 0) {
                      responseBuffer.flip();
                      handleResponse(responseBuffer);
                      Thread.sleep(1000);
                    } else {
                      tlsChannel.close();
                      break mainloop;
                    }
                  }
                } catch (NeedsReadException e) {
                  key.interestOps(SelectionKey.OP_READ);
                } catch (NeedsWriteException e) {
                  key.interestOps(SelectionKey.OP_WRITE);
                } catch (InterruptedException e) {
                  throw new RuntimeException(e);
                }
              } else {
                throw new IllegalStateException();
              }
            }
          }
        }
      }
    }

    private void handleResponse(ByteBuffer responseBuffer) {
      String json = utf8.decode(responseBuffer).toString().substring(4);
      Wrapper wr = new CodableHelper().decode(json, Wrapper.class);
      try {
        if (Objects.equals(wr.command, "request")) {
          requestSent = false;
          if (Objects.equals(wr.payload.codingKey, 3)) {
            String res = new String(Base64.decode(wr.payload.data, Base64.NO_WRAP));
            Log.d(LpcUtils.TAG, "handleResponse: " + res);
            Gson gson = new Gson();
            JSONObject obj = new JSONObject(res);
            Map<String, String> m = gson.fromJson(obj.getString("custom"), Map.class);
            m.put("lpc", "true");
            // start incoming call activity
            Ctx.wakeFromPn(mContext);
            BrekekeUtils.onFcmMessageReceived(m);
            // emit message to assign callKeepUuid to call store
            String e = LpcUtils.convertMapToString(m);
            Emitter.emit("lpcIncomingCall", e);
            Log.d(LpcUtils.TAG, "Incoming call started by Lpc");
          }
        }
      } catch (Exception e) {
        Log.d(LpcUtils.TAG, "handleResponse error: " + e.getMessage());
      }
    }

    // adds 4 bytes to the size of the message
    private byte[] addSizeToMessage(String message) {
      byte[] jsonBytes = message.getBytes(StandardCharsets.UTF_8);
      int lengthJson = jsonBytes.length;
      ByteBuffer lengthBuffer = ByteBuffer.allocate(4).order(ByteOrder.LITTLE_ENDIAN);
      lengthBuffer.putInt(lengthJson);
      ByteBuffer buffer = ByteBuffer.allocate(4 + lengthJson).order(ByteOrder.LITTLE_ENDIAN);
      buffer.put(lengthBuffer.array());
      buffer.put(jsonBytes);
      return buffer.array();
    }

    private byte[] getDataParams() throws IOException {
      Map<String, Object> map = new HashMap<>();
      Map<String, Object> p = new HashMap<>();
      map.put("requestIdentifier", new Random().nextInt(999999999));
      LpcModel.User u =
          new LpcModel().new User(this.settings.token, this.settings.token, this.settings.userName);
      map.put("payload", new Payload(u));
      map.put("command", "request");
      String data = new CodableHelper().encode(map);
      return addSizeToMessage(data);
    }
  }
}
