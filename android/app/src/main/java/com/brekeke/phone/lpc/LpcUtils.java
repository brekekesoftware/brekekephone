package com.brekeke.phone.lpc;

import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Base64;
import android.util.Log;
import com.brekeke.phone.R;
import com.brekeke.phone.utils.L;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableType;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Formatter;
import java.util.Map;
import javax.net.ssl.*;
import org.json.JSONObject;

public class LpcUtils {
  public static String TAG = "[BrekekeLpcService]";

  public static String NOTI_CHANNEL_ID = "NOTIFICATION_CHANNEL";
  public static int NOTI_ID = 0;

  public static Intent putConfigToIntent(
      String host,
      int port,
      String token,
      String userName,
      String tlsKeyHash,
      ArrayList<String> remoteSsids,
      Intent i) {
    i.putExtra("token", token);
    i.putExtra("username", userName);
    i.putExtra("host", host);
    i.putExtra("port", port);
    i.putExtra("tlsKeyHash", tlsKeyHash);
    i.putStringArrayListExtra("remoteSsids", remoteSsids);
    return i;
  }

  // construct and load our normal React JS code bundle
  public static void createReactContextInBackground(ReactApplication r) {
    ReactInstanceManager rim = r.getReactNativeHost().getReactInstanceManager();
    if (!rim.hasStartedCreatingInitialContext()) {
      rim.createReactContextInBackground();
    }
  }

  public static boolean checkAppInBackground() {
    if (!BrekekeLpcService.isServiceStarted) {
      return false;
    }

    ActivityManager.RunningAppProcessInfo myProcess = new ActivityManager.RunningAppProcessInfo();
    ActivityManager.getMyMemoryState(myProcess);
    return myProcess.importance != ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND;
  }

  public static void showIncomingCallNotification(Context appCtx, Intent i) {
    if (!checkAppInBackground()) {
      return;
    }
    i.setAction(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
    // fix: the application crashes when it is in the background state and there is an
    // incoming call
    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
      // |= is used to add a flag without losing other flags already present in the flags
      // variable.
      flags |= PendingIntent.FLAG_IMMUTABLE;
    }
    PendingIntent pi = PendingIntent.getActivity(appCtx, 0, i, flags);

    Notification notification =
        new Notification.Builder(appCtx, NOTI_CHANNEL_ID)
            // fix: the app will crash: "Invalid notification (no valid small icon)"
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(L.incomingCall())
            .setCategory(Notification.CATEGORY_CALL)
            .setFullScreenIntent(pi, true)
            .build();
    NotificationManager nm =
        (NotificationManager) appCtx.getSystemService(Context.NOTIFICATION_SERVICE);
    nm.notify(TAG, NOTI_ID, notification);
  }

  public static final ServiceConnection connection =
      new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName className, IBinder service) {}

        @Override
        public void onServiceDisconnected(ComponentName arg0) {}
      };

  public static String convertMapToString(Map<String, String> m) {
    JSONObject jsonObject = new JSONObject(m);
    return jsonObject.toString();
  }

  public static class LpcCallback {
    public static callbackInterface cb;

    public interface callbackInterface {
      void getStateServer(Boolean b);
    }

    public static void setLpcCallback(callbackInterface c) {
      cb = c;
    }
  }

  // utils to get MIUI

  public static boolean isMIUI() {
    return !TextUtils.isEmpty(getSystemProperty("ro.miui.ui.version.name"));
  }

  @SuppressLint("PrivateApi")
  private static String getSystemProperty(String key) {
    try {
      Class p = Class.forName("android.os.SystemProperties");
      return (String) p.getMethod("get", String.class).invoke(null, key);
    } catch (Exception e) {
    }
    return null;
  }

  public static Intent getPermissionManagerIntent(Context ctx) {
    Intent i = new Intent("miui.intent.action.APP_PERM_EDITOR");
    i.putExtra("extra_package_uid", android.os.Process.myUid());
    i.putExtra("extra_pkgname", ctx.getPackageName());
    i.putExtra("extra_package_name", ctx.getPackageName());
    return i;
  }

  // read write config

  public static String fileName = "BrekekeConfig";

  public static void writeConfig(Context context, String content) {
    try (FileOutputStream fos = context.openFileOutput(fileName, Context.MODE_PRIVATE)) {
      fos.write(content.getBytes());
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  public static String readConfig(Context context) throws FileNotFoundException {
    FileInputStream fis = context.openFileInput(fileName);
    InputStreamReader inputStreamReader = new InputStreamReader(fis, StandardCharsets.UTF_8);
    StringBuilder stringBuilder = new StringBuilder();
    try (BufferedReader reader = new BufferedReader(inputStreamReader)) {
      String line = reader.readLine();
      while (line != null) {
        stringBuilder.append(line).append('\n');
        line = reader.readLine();
      }
      return stringBuilder.toString();
    } catch (IOException e) {
      Log.d(TAG, "readConfig: " + e.getMessage());
    }
    return "";
  }

  // trust ca keyhash..

  static TrustManager[] trustAllCerts =
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

  public static SSLContext createTrustedSSLContext(String sha256Fingerprint, Context mContext)
      throws Exception {
    SSLContext sslContext = SSLContext.getInstance("TLSv1.3");

    // TODO: handle CA
    if (false) {
      // convert SHA-256 fingerprint from base64 to byte array
      byte[] sha256Bytes = Base64.decode(sha256Fingerprint, Base64.NO_WRAP);
      // load certificate from file
      CertificateFactory certificateFactory = CertificateFactory.getInstance("X.509");
      InputStream raw = mContext.getResources().openRawResource(R.raw.ca);
      X509Certificate certificate = (X509Certificate) certificateFactory.generateCertificate(raw);
      raw.close();
      // calculate the SHA-256 fingerprint of the certificate
      byte[] certFingerprint = certificate.getPublicKey().getEncoded();
      String str = new String(certFingerprint, StandardCharsets.UTF_8);
      // compare the fingerprints
      if (!MessageDigest.isEqual(sha256Bytes, certFingerprint)) {
        Log.d(
            LpcUtils.TAG,
            "Certificate fingerprint does not match the provided SHA-256 fingerprint.");
      }
      // create a TrustManager that trusts the certificate
      KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
      keyStore.load(null, null);
      keyStore.setCertificateEntry("ca", certificate);
      TrustManagerFactory trustManagerFactory =
          TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
      trustManagerFactory.init(keyStore);

      sslContext.init(null, trustManagerFactory.getTrustManagers(), null);
    }

    // TODO: accept all CA for now
    sslContext.init(null, trustAllCerts, null);

    return sslContext;
  }

  // TODO: match ssid in background service where it initiates the connection
  public static Boolean matchSsid(ReadableArray remoteSsid, String localSsid) {
    for (int i = 0; i < remoteSsid.size(); i++) {
      ReadableType type = remoteSsid.getType(i);
      if (type == ReadableType.String && remoteSsid.getString(i).equals(localSsid)) {
        return true;
      }
    }
    return false;
  }

  // Convert ReadableArray to String[]
  public static ArrayList<String> convertReadableArrayToStringList(ReadableArray array) {
    ArrayList<String> result = new ArrayList<>();

    if (array == null || array.size() == 0) {
      return result;
    }

    for (int i = 0; i < array.size(); i++) {
      try {
        String value = null;
        if (array.getType(i) == ReadableType.String) {
          value = array.getString(i);
        } else {
          value = String.valueOf(array.getDynamic(i).asString());
        }

        if (value != null && !"null".equals(value)) {
          result.add(value);
        }

      } catch (Exception e) {
      }
    }

    return result;
  }
}
