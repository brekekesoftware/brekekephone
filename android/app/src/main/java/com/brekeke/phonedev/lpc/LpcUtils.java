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
import java.util.Arrays;
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
                byte[] certDer = chain[0].getEncoded();
                byte[] spki = extractSPKI(certDer);
                if (spki == null) {
                  throw new CertificateException("Failed to extract SPKI from certificate");
                }
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

  // Extract SubjectPublicKeyInfo (SPKI) from raw certificate DER bytes.
  // Reads bytes directly from the certificate DER instead of using
  // getPublicKey().getEncoded(), which may re-encode differently across
  // Android versions and manufacturers (causing keyhash mismatch on some devices).
  private static byte[] extractSPKI(byte[] der) {
    int[] i = {0};
    if (!enterSequence(der, i)) return null; // Certificate
    if (!enterSequence(der, i)) return null; // TBSCertificate
    if (i[0] < der.length && (der[i[0]] & 0xFF) == 0xA0) {
      if (!skipTLV(der, i)) return null; // version [0] EXPLICIT
    }
    if (!skipTLV(der, i)) return null; // serialNumber
    if (!skipTLV(der, i)) return null; // signature
    if (!skipTLV(der, i)) return null; // issuer
    if (!skipTLV(der, i)) return null; // validity
    if (!skipTLV(der, i)) return null; // subject
    int spkiStart = i[0];
    if (i[0] >= der.length || (der[i[0]] & 0xFF) != 0x30) return null;
    i[0]++;
    int spkiLen = readLength(der, i);
    if (spkiLen < 0) return null;
    int spkiEnd = i[0] + spkiLen;
    if (spkiEnd > der.length) return null;
    return Arrays.copyOfRange(der, spkiStart, spkiEnd);
  }

  private static boolean enterSequence(byte[] der, int[] i) {
    if (i[0] >= der.length || (der[i[0]] & 0xFF) != 0x30) return false;
    i[0]++;
    return readLength(der, i) >= 0;
  }

  private static boolean skipTLV(byte[] der, int[] i) {
    if (i[0] >= der.length) return false;
    i[0]++; // skip tag
    int len = readLength(der, i);
    if (len < 0) return false;
    i[0] += len;
    return i[0] <= der.length;
  }

  private static int readLength(byte[] der, int[] i) {
    if (i[0] >= der.length) return -1;
    int first = der[i[0]++] & 0xFF;
    if ((first & 0x80) == 0) return first;
    int n = first & 0x7F;
    if (n == 0 || n > 4 || i[0] + n > der.length) return -1;
    int len = 0;
    for (int k = 0; k < n; k++) len = (len << 8) | (der[i[0]++] & 0xFF);
    return len;
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
