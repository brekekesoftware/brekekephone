package com.brekeke.phonedev;

import android.content.Context;
import android.util.Base64;
import android.util.Log;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Formatter;
import javax.net.ssl.*;

public class BrekekeTrust {

  private static final String TAG = "[BrekekeLpcService]trust";

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
    // Convert SHA-256 fingerprint from base64 to byte array
    byte[] sha256Bytes = Base64.decode(sha256Fingerprint, Base64.NO_WRAP);
    // Load certificate from file
    CertificateFactory certificateFactory = CertificateFactory.getInstance("X.509");
    InputStream raw = mContext.getResources().openRawResource(R.raw.ca);
    X509Certificate certificate = (X509Certificate) certificateFactory.generateCertificate(raw);
    raw.close();

    // Calculate the SHA-256 fingerprint of the certificate
    byte[] certFingerprint = certificate.getPublicKey().getEncoded();
    String str = new String(certFingerprint, StandardCharsets.UTF_8);
    // Compare the fingerprints
    if (!MessageDigest.isEqual(sha256Bytes, certFingerprint)) {
      Log.d(TAG, "Certificate fingerprint does not match the provided SHA-256 fingerprint.");
    }

    // Create a TrustManager that trusts the certificate
    KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
    keyStore.load(null, null);
    keyStore.setCertificateEntry("ca", certificate);
    TrustManagerFactory trustManagerFactory =
        TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
    trustManagerFactory.init(keyStore);

    // Create SSLContext with the TrustManager
    SSLContext sslContext = SSLContext.getInstance("TLSv1.3");
    // pass all CA
    sslContext.init(null, trustAllCerts, null);
    //        sslContext.init(null, trustManagerFactory.getTrustManagers(), null);

    return sslContext;
  }
}
