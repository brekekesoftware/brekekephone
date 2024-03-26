package com.brekeke.phonedev;

import static java.net.StandardSocketOptions.SO_KEEPALIVE;
import static java.net.StandardSocketOptions.TCP_NODELAY;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.AsyncTask;
import android.os.Build;
import android.os.CountDownTimer;
import android.os.NetworkOnMainThreadException;
import android.util.Base64;
import android.util.Log;
import com.google.gson.Gson;
import com.tlschannel.ClientTlsChannel;
import com.tlschannel.NeedsReadException;
import com.tlschannel.NeedsWriteException;
import com.tlschannel.TlsChannel;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.SocketChannel;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

public class BrekekeSSLSocket {
  public class SSLSocketAsyncTask extends AsyncTask<LPCModel.Settings, Void, String> {

    private String TAG = "[BrekekeLpcService]";

    CountDownTimer cTimer = null;

    private String host;

    private int port;

    private  LPCModel.User user;

    private LPCModel.Settings settings;

    private Charset utf8 = StandardCharsets.UTF_8;

    private String mock =
        "Data{\"requestIdentifier\":504316054,\"payload\":{\"data\":\"eyJ1dWlkIjoiRkFBMUI2QUItNTdFMy00RUU4LUJDOTQtMzM1MTdCNUI0QkFEIiwiZGV2aWNlTmFtZSI6ImlQaG9uZSAxNSBQcm8ifQ==\",\"codingKey\":1},\"command\":\"request\"}";

    TrustManager[] trustAllCerts =
        new TrustManager[] {
          new X509TrustManager() {
            @Override
            public void checkClientTrusted(
                java.security.cert.X509Certificate[] chain, String authType)
                throws CertificateException {}

            @Override
            public void checkServerTrusted(
                java.security.cert.X509Certificate[] chain, String authType)
                throws CertificateException {}

            @Override
            public java.security.cert.X509Certificate[] getAcceptedIssuers() {
              return new java.security.cert.X509Certificate[] {};
            }
          }
        };

    public SSLSocketAsyncTask() {}

    public class CodableHelper {
      private final Gson gson = new Gson();

      public <T> String encode(T object) {
        return gson.toJson(object);
      }

      public <T> T decode(String json, Class<T> type) {
        return gson.fromJson(json, type);
      }
    }

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
        Log.d(TAG + "data", new CodableHelper().encode(data));
        this.data =
            new String(
                Base64.encode(
                    (new CodableHelper().encode(data)).getBytes(StandardCharsets.UTF_8),
                    Base64.NO_WRAP));

        Log.d(TAG + "data", this.data);
      }
    }

    public class Wrapper {
      private String requestIdentifier = "2979930849";
      private String command = "request";
      private Payload payload;

      public Wrapper(Payload payload) {
        this.payload = payload;
      }
    }

    @Override
    protected String doInBackground(LPCModel.Settings ...params) {
      Log.d(TAG, String.valueOf(params[0]).toString());
     this.settings = params[0];
     this.user = new LPCModel().new User(settings.token, settings.userName);
      this.handleCallToServer();
      return "";
    }

    @Override
    protected void onCancelled() {
      Log.d("[BrekekeLpcService]", "Candelled");
    }

    @Override
    protected void onPostExecute(String result) {
      Log.d("[BrekekeLpcService]", "Received data: " + result);
    }

    private void handleCallToServer() {

      try {
        SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
        sslContext.init(null, trustAllCerts, new SecureRandom());
        this.createChannel(sslContext);

      } catch (NoSuchAlgorithmException e) {
        e.printStackTrace();
        Log.d(TAG + "N", e.getMessage());
      } catch (KeyManagementException e) {
        e.printStackTrace();
        Log.d(TAG + "K", e.getMessage());
      } catch (NetworkOnMainThreadException | GeneralSecurityException e) {
        e.printStackTrace();
        Log.d(TAG + "NE", e.getMessage());
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }

    public void createChannel(SSLContext sslContext) throws IOException, GeneralSecurityException {

      byte[] data = getDataParams();
      ByteBuffer requestBuffer = ByteBuffer.wrap(data);
      ByteBuffer responseBuffer = ByteBuffer.allocateDirect(1024);
      boolean requestSent = false;

      Selector selector = Selector.open();

      try (SocketChannel rawChannel = SocketChannel.open()) {
        rawChannel.configureBlocking(false);
        rawChannel.setOption(SO_KEEPALIVE, true);
        rawChannel.setOption(TCP_NODELAY, true);
        Log.d(TAG, this.settings.host);
        rawChannel.connect(new InetSocketAddress(this.settings.host, this.settings.port == 0 ? 3000: 1));

        rawChannel.register(selector, SelectionKey.OP_CONNECT);

        ClientTlsChannel.Builder builder = ClientTlsChannel.newBuilder(rawChannel, sslContext);

        try (TlsChannel tlsChannel = builder.build()) {
          mainloop:
          while (true) {

            selector.select();

            Iterator<SelectionKey> iterator = selector.selectedKeys().iterator();
            Log.d(TAG + "iterator", String.valueOf(iterator.hasNext()));
            while (iterator.hasNext()) {
              SelectionKey key = iterator.next();
              iterator.remove();
              Log.d(TAG + "connected", String.valueOf(key.isConnectable()));
              Log.d(TAG + "finish", String.valueOf(rawChannel.finishConnect()));
              if (key.isConnectable()) {
                if (rawChannel.finishConnect()) {
                  // the channel is registered for writing, because TLS connections are initiated by
                  // clients.
                  rawChannel.register(selector, SelectionKey.OP_WRITE);
                }

              } else if (key.isReadable() || key.isWritable()) {
                //                                Log.d(TAG + "write",
                // String.valueOf(key.isWritable()));
                //                                Log.d(TAG + "requestSent",
                // String.valueOf(requestSent));
                try {
                  if (!requestSent) {
                    tlsChannel.write(requestBuffer);

                    if (requestBuffer.remaining() == 0) {
                      requestSent = true;
                      Log.d(TAG + "write", "remain");
                      rawChannel.shutdownOutput();
                    }

                  } else {
                    int c = tlsChannel.read(responseBuffer);
                    Log.d(TAG + "receiverCount", String.valueOf(c));
                    if (c > 0) {
                      responseBuffer.flip();
                      String json =  utf8.decode(responseBuffer).toString().substring(4);
                       Log.d(TAG + "receiver",json);
                       Wrapper wr = new CodableHelper().decode(json, Wrapper.class);
                      responseBuffer.compact();
                    }
                    if (c < 0 | c == 0) {
                      tlsChannel.close();
                      break mainloop;
                    }
                  }

                } catch (NeedsReadException e) {
                  //                                    Log.d(TAG + "r1", e.getMessage());
                  key.interestOps(SelectionKey.OP_READ); // overwrites previous value
                } catch (NeedsWriteException e) {
                  //                                    Log.d(TAG + "r", e.getMessage());
                  key.interestOps(SelectionKey.OP_WRITE); // overwrites previous value
                }

              } else {
                throw new IllegalStateException();
              }
            }
          }
        }
      }
    }

    private byte[] getDataParams() throws UnsupportedEncodingException {
      String uuid = UUID.randomUUID().toString();
      String deviceName = Build.MANUFACTURER + " " + Build.MODEL;

      Map<String, Object> map = new HashMap<>();
      map.put("requestIdentifier", new Random().nextInt(999999999));
      map.put("payload", new Payload(new Person(deviceName, uuid)));
      map.put("command", "request");

      String data = new CodableHelper().encode(map);
      byte[] dataBytes = ("Data" + data).getBytes("utf-8");
      return dataBytes;
    }

    private void countDown() {
      cTimer =
          new CountDownTimer(60000, 1000) {
            public void onTick(long millisUntilFinished) {
              Log.d(TAG, "Seconds remaining: " + millisUntilFinished / 1000);
            }

            public void onFinish() {
              Log.d(TAG, "Countdown done!");
            }
          }.start();
    }

    public void receiver(SSLSocket socket) {
      ExecutorService readExecutor = Executors.newSingleThreadExecutor();
      readExecutor.execute(
          new Runnable() {
            @Override
            public void run() {
              try {
                byte[] buffer = new byte[1024];
                int bytesRead = socket.getInputStream().read(buffer);
                final String receivedData = new String(buffer, 0, bytesRead);
                Log.d(TAG, receivedData);
              } catch (IOException ioe) {
                Log.d(TAG + "ioe", ioe.getMessage());
              }
            }
          });
    }

    public void write(SocketChannel socket, byte[] data) {

      ExecutorService writeExecutor = Executors.newSingleThreadExecutor();
      writeExecutor.execute(
          new Runnable() {
            @Override
            public void run() {
              if (socket == null) {
                return;
              }
              try {
                //                        BufferedWriter wr = new BufferedWriter(new
                // OutputStreamWriter(socket.getOutputStream()));
                //                        wr.write(mock.toString(), 0, mock.length());
                //                        wr.flush();
                //                        wr.newLine();
                //                        OutputStream o = socket.getOutputStream();
                socket.write(ByteBuffer.wrap(data));
                socket.shutdownOutput();
                socket.close();
                //                        BufferedOutputStream bufferedOutputStream = new
                // BufferedOutputStream(o, data.length + 4);
                //
                //                        bufferedOutputStream.write(data);
                //                        bufferedOutputStream.flush();

                //                        bufferedOutputStream.close();

                //                      bufferedOutputStream.close();
                //                      bufferedOutputStream.close();
                //                      bufferedOutputStream.close();

                Log.d(TAG + "sent", "Ahihi");
              } catch (IOException e) {

              }
            }
          });
    }
  }
}
