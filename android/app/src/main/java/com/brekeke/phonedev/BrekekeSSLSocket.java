package com.brekeke.phonedev;

import static java.net.StandardSocketOptions.SO_KEEPALIVE;
import static java.net.StandardSocketOptions.SO_REUSEADDR;
import static java.net.StandardSocketOptions.SO_SNDBUF;
import static java.net.StandardSocketOptions.TCP_NODELAY;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
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

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
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
import java.security.InvalidAlgorithmParameterException;
import java.security.KeyFactory;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.cert.CertPath;
import java.security.cert.CertPathValidator;
import java.security.cert.CertPathValidatorException;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.PKIXParameters;
import java.security.cert.X509Certificate;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Formatter;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.ManagerFactoryParameters;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

public class BrekekeSSLSocket {
  public class SSLSocketAsyncTask extends AsyncTask<LPCModel.Settings, Void, String> {

    private String TAG = "[BrekekeLpcService]";

    private Context mContext;

    CountDownTimer cTimer = null;

    private String host;

    private int port;

    private  LPCModel.User user;

    private LPCModel.Settings settings;

    private Charset utf8 = StandardCharsets.UTF_8;

    private String mock =
        "Data{\"requestIdentifier\":504316054,\"payload\":{\"data\":\"eyJ1dWlkIjoiRkFBMUI2QUItNTdFMy00RUU4LUJDOTQtMzM1MTdCNUI0QkFEIiwiZGV2aWNlTmFtZSI6ImlQaG9uZSAxNSBQcm8ifQ==\",\"codingKey\":1},\"command\":\"request\"}";
    private String mockBre = "Data{\"payload\":{\"codingKey\":1,\"data\":\"eyJ1dWlkIjoiMmMzNTMwZmM3MjRiZWFjMDk4YTM0Yjk5NzhkMDg5NGU4ODJjN2UxZjZiNTVjZjllMDVkMGVkMzAyNzBjZjUwOCRwbi1nd0BuYW1fbmFtMDNfcGhvbmUzX3dlYnBob25lIiwidXVpZDIiOiIxZDE4YjY2YjI4ZTA1Mzk4NWU2YThjMjFmYjNkNWIzOTA0OGViZDIwMWE2OGRhYWQwYWJjMWJlYTg0NjEzNzI5JHBuLWd3QG5hbV9uYW0wM19waG9uZTNfd2VicGhvbmVAdm9pcCIsImFwcGlkIjoiY29tLmJyZWtla2UucGhvbmVkZXYiLCJkZXZpY2VOYW1lIjoibmFtX25hbTAzX3Bob25lM193ZWJwaG9uZSJ9\"},\"command\":\"request\",\"requestIdentifier\":4127205467}";

    private String mockLpc = "{\"uuid\":\"805b2b98d51ce3a3d6dc540ec38e6d7d7b155889f4da9975c1f96c2c69a71b98cc6f5b74492ad167e3d990701e0960dd8b189a47af5d8f970d68f6f1b9f984628fa5fbb058c709e463e311980328981a$pn-gw@nam_nam03_phone3_webphone\",\"uuid2\":\"808c693431851a40c8f93c46aeb2d6c9c2840112194c8af1d47ed2644704eeb7fc14b79247776fced5f731183e5a8235f94e5421559e8935e09acbe3aeabdcd55e5ea65a8ae5685cf3201a78073b426d$pn-gw@nam_nam03_phone3_webphone@voip\",\"deviceName\":\"nam_nam03_phone3_webphone\",\"appid\":\"com.brekeke.phonedev\"}";

    private String mockEx = "{\"payload\":{\"codingKey\":1,\"data\":\"eyJ1dWlkIjoiMmMzNTMwZmM3MjRiZWFjMDk4YTM0Yjk5NzhkMDg5NGU4ODJjN2UxZjZiNTVjZjllMDVkMGVkMzAyNzBjZjUwOCRwbi1nd0BuYW1fbmFtMDFfcGhvbmUxX3dlYnBob25lIiwidXVpZDIiOiIxZDE4YjY2YjI4ZTA1Mzk4NWU2YThjMjFmYjNkNWIzOTA0OGViZDIwMWE2OGRhYWQwYWJjMWJlYTg0NjEzNzI5JHBuLWd3QG5hbV9uYW0wMV9waG9uZTFfd2VicGhvbmVAdm9pcCIsImFwcGlkIjoiY29tLmJyZWtla2UucGhvbmVkZXYiLCJkZXZpY2VOYW1lIjoibmFtX25hbTAxX3Bob25lMV93ZWJwaG9uZSJ9\"},\"command\":\"request\",\"requestIdentifier\":4093394966}";
    private KeyStore trustStore;
    TrustManager[] trustAllCerts =
        new TrustManager[] {
          new X509TrustManager() {


            @Override
            public void checkClientTrusted(
                java.security.cert.X509Certificate[] chain, String authType)
                throws CertificateException {
//              if (chain == null || chain.length == 0 || chain[0] == null) {
//                throw new CertificateException("Certificate chain is not valid");
//              }
//              X509Certificate cert = chain[1];
//              String sha256 = getSha256(cert);
//              Log.d(TAG+"cert", sha256);
//              if (!sha256.equals("67add1166b020ae61b8f5fc96813c04c2aa589960796865572a3c7e737613dfd")) {
//                throw new CertificateException("Certificate pinning failed");
//              }
            }

            @Override
            public void checkServerTrusted(
                java.security.cert.X509Certificate[] chain, String authType)
                throws CertificateException {
//               if (chain == null || chain.length == 0 || chain[0] == null) {
//                 throw new CertificateException("Certificate chain is not valid");
//               }
//               X509Certificate cert = chain[1];
//               String sha256 = getSha256(cert);
//               Log.d(TAG+"cert", sha256);
//               if (!sha256.equals("67add1166b020ae61b8f5fc96813c04c2aa589960796865572a3c7e737613dfd")) {
//                 throw new CertificateException("Certificate pinning failed");
//               }
            }

            @Override
            public java.security.cert.X509Certificate[] getAcceptedIssuers() {
//              return new X509Certificate[0];
              return new java.security.cert.X509Certificate[] {};
            }

            private String getSha256(X509Certificate cert) throws CertificateException {
              try {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] encoded = digest.digest(cert.getEncoded());
                return bytesToHex(encoded);
              } catch (Exception e) {
                throw new CertificateException("Could not generate SHA-256", e);
              }
            }

            private String bytesToHex(byte[] bytes) {
              Formatter formatter = new Formatter();
              for (byte b : bytes) {
                formatter.format("%02x", b);
              }
              String result = formatter.toString();
              formatter.close();
              return result;
            }
          }
        };

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
//        this.data =
//            new String(
//                Base64.encode(
//                    (new CodableHelper().encode(data)).getBytes(StandardCharsets.UTF_8),
//                    Base64.NO_WRAP));

                this.data =
            new String(
                Base64.encode(
                        mockLpc.getBytes(StandardCharsets.UTF_8),
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

    public  SSLContext createTrustedSSLContext(String sha256Fingerprint) throws Exception {
      // Convert SHA-256 fingerprint from base64 to byte array
      byte[] sha256Bytes = android.util.Base64.decode(sha256Fingerprint, android.util.Base64.DEFAULT);

      // Load certificate from file
      CertificateFactory certificateFactory = CertificateFactory.getInstance("X.509");
      InputStream raw = mContext.getResources().openRawResource(R.raw.out);
      X509Certificate certificate = (X509Certificate) certificateFactory.generateCertificate(raw);
      raw.close();

      // Calculate the SHA-256 fingerprint of the certificate
      byte[] certFingerprint = certificate.getPublicKey().getEncoded();

      // Compare the fingerprints
      if (!MessageDigest.isEqual(sha256Bytes, certFingerprint)) {
//        Log.d(TAG, "Certificate fingerprint does not match the provided SHA-256 fingerprint.");x
      }

      // Create a TrustManager that trusts the certificate
      KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
      keyStore.load(null, null);
      keyStore.setCertificateEntry("ca", certificate);
      TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
      trustManagerFactory.init(keyStore);

      // Create SSLContext with the TrustManager
      SSLContext sslContext = SSLContext.getInstance("TLSv1.3");
      sslContext.init(null, trustManagerFactory.getTrustManagers(), null);

      return sslContext;
    }

    public TrustManagerFactory generatePublicKey(String encodedPublicKey) {
      try {
        byte[] decodedBytes = Base64.decode(encodedPublicKey, Base64.DEFAULT);
        ByteArrayInputStream fileInputStream = new ByteArrayInputStream(decodedBytes);
        CertificateFactory certFactory = CertificateFactory
                .getInstance("X.509");
        X509Certificate cert = (X509Certificate) certFactory
                .generateCertificate(fileInputStream);
        trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
        trustStore.load(null, null);
        String alias = cert.getSubjectX500Principal().getName();
        trustStore.setCertificateEntry(alias, cert);
        TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        tmf.init(trustStore);
        return tmf;
      } catch (CertificateException e) {
        Log.d(TAG, e.getMessage());
      } catch (KeyStoreException e) {
        Log.d(TAG, e.getMessage());
      } catch (NoSuchAlgorithmException e) {
        Log.d(TAG, e.getMessage());
      } catch (IOException e) {
        Log.d(TAG, e.getMessage());
      }

      return null;
    }
    private void handleCallToServer() {

      try {
        SSLContext sslContext = createTrustedSSLContext("gkyJATDzkj83UgyeJZaCTCrIesUcKHrTMOpjlVTfmLc=");
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
//        throw new RuntimeException(e);
        Log.d(TAG + "IO", e.getMessage());
      } catch (Exception e) {
        Log.d(TAG + "Ex", e.getMessage());
      }
    }

    public void createChannel(SSLContext sslContext) throws IOException, GeneralSecurityException {

      byte[] data = getDataParams();
      ByteBuffer requestBuffer = ByteBuffer.wrap(mockBre.getBytes("utf-8"), 0, mockBre.getBytes("utf-8").length);
      ByteBuffer responseBuffer = ByteBuffer.allocateDirect(8096);
      boolean requestSent = false;

      Selector selector = Selector.open();

      try (SocketChannel rawChannel = SocketChannel.open()) {
        rawChannel.configureBlocking(false);
        rawChannel.setOption(SO_KEEPALIVE, true);
        rawChannel.setOption(TCP_NODELAY, true);
//        rawChannel.setOption(SO_REUSEADDR, true);
//        rawChannel.setOption(SO_SNDBUF, 8096);
//        rawChannel.connect(new InetSocketAddress("Yees-mbp.lan", this.settings.port));
        rawChannel.connect(new InetSocketAddress(this.settings.host, this.settings.port));
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
              Log.d(TAG + "connected", String.valueOf(rawChannel.isConnected()));
              Log.d(TAG + "finish", String.valueOf(rawChannel.finishConnect()));
              if (key.isConnectable()) {
                if (rawChannel.finishConnect()) {
                  rawChannel.register(selector, SelectionKey.OP_WRITE);
                }
              } else if (key.isReadable() || key.isWritable()) {
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
                      Log.d(TAG + "receiver", json);
                      Wrapper wr = new CodableHelper().decode(json, Wrapper.class);
                      responseBuffer.compact();
                    }
                    if (c < 0 | c == 0) {
                      tlsChannel.close();
                      break mainloop;
                    }
                  }
                } catch (NeedsReadException e) {
//                  Log.d(TAG, e.getMessage());
                  key.interestOps(SelectionKey.OP_READ);

                } catch (NeedsWriteException e) {
//                  Log.d(TAG, e.getMessage());
                  key.interestOps(SelectionKey.OP_WRITE);

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
      String uuid2 = UUID.randomUUID().toString();
      String deviceName = Build.MANUFACTURER + " " + Build.MODEL;

      Map<String, Object> map = new HashMap<>();
      Map<String, Object> p =  new HashMap<>();
       map.put("requestIdentifier", new Random().nextInt(999999999));
      LPCModel.User u = new LPCModel().new User(this.settings.token, this.settings.token, this.settings.userName);
//      map.put("payload", new Payload(new Person(deviceName, uuid)));
      map.put("payload", new Payload(u));
      map.put("command", "request");

      String data = new CodableHelper().encode(map);
      Log.d(TAG, data);
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
