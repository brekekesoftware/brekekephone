package com.brekeke.phonedev.lpc;

import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.text.TextUtils;
import android.util.Base64;
import android.util.Log;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableType;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
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

  // Verify the server certificate by comparing SHA-256(SubjectPublicKeyInfo DER) to the
  // configured hash. PublicKey.getEncoded() returns the full SPKI DER bytes, which include
  // the AlgorithmIdentifier OID — so this works for RSA, ECDSA, and any future algorithm
  // without code changes.
  public static SSLContext createTrustedSSLContext(String sha256Fingerprint, Context mContext)
      throws Exception {
    SSLContext sslContext = SSLContext.getInstance("TLS");

    TrustManager[] trustManagers =
        new TrustManager[] {
          new X509TrustManager() {
            @Override
            public void checkClientTrusted(X509Certificate[] chain, String authType) {}

            @Override
            public void checkServerTrusted(X509Certificate[] chain, String authType)
                throws CertificateException {
              if (sha256Fingerprint == null || sha256Fingerprint.isEmpty()) {
                return;
              }
              if (chain == null || chain.length == 0) {
                throw new CertificateException("Empty certificate chain");
              }
              try {
                byte[] spki = chain[0].getPublicKey().getEncoded();
                byte[] hash = MessageDigest.getInstance("SHA-256").digest(spki);
                String fingerprint = Base64.encodeToString(hash, Base64.NO_WRAP);
                if (!fingerprint.equals(sha256Fingerprint)) {
                  throw new CertificateException("Certificate fingerprint does not match");
                }
              } catch (NoSuchAlgorithmException e) {
                throw new CertificateException("SHA-256 not available", e);
              }
            }

            @Override
            public X509Certificate[] getAcceptedIssuers() {
              return new X509Certificate[] {};
            }
          }
        };

    sslContext.init(null, trustManagers, null);
    return sslContext;
  }

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
