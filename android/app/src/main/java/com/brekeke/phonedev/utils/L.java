package com.brekeke.phonedev.utils;

// labels for multi langues
public class L {
  private static String l = null;

  public static void init() {
    try {
      set(Storage.locale());
    } catch (Exception e) {
    }
  }

  public static void set(String newL) {
    l = newL;
    if (l == null) {
      l = "en";
    }
    if (!"en".equals(l) && !"ja".equals(l)) {
      l = "en";
    }
  }

  public static String unlock() {
    return "ja".equals(l) ? "ロック解除" : "UNLOCK";
  }

  public static String nCallsInBackground(int n) {
    return n
        + ("ja".equals(l)
            ? " 他の通話はバックグランドにあります"
            : (" OTHER CALL" + (n > 1 ? "S ARE" : " IS") + " IN BACKGROUND"));
  }

  public static String incomingCall() {
    return "ja".equals(l) ? "着信" : "Incoming Call";
  }

  public static String connecting() {
    return "ja".equals(l) ? "接続中..." : "Connecting...";
  }

  public static String transfer() {
    return "ja".equals(l) ? "転送" : "TRANSFER";
  }

  public static String park() {
    return "ja".equals(l) ? "パーク" : "PARK";
  }

  public static String video() {
    return "ja".equals(l) ? "ビデオ" : "VIDEO";
  }

  public static String speaker() {
    return "ja".equals(l) ? "スピーカー" : "SPEAKER";
  }

  public static String mute() {
    return "ja".equals(l) ? "ミュート" : "MUTE";
  }

  public static String unmute() {
    return "ja".equals(l) ? "ミュート解除" : "UNMUTE";
  }

  public static String record() {
    return "ja".equals(l) ? "録音" : "RECORD";
  }

  public static String dtmf() {
    return "ja".equals(l) ? "キーパッド" : "KEYPAD";
  }

  public static String hold() {
    return "ja".equals(l) ? "保留" : "HOLD";
  }

  public static String unhold() {
    return "ja".equals(l) ? "保留解除" : "UNHOLD";
  }

  public static String callIsOnHold() {
    return "ja".equals(l) ? "保留中" : "CALL IS ON HOLD";
  }

  public static String titlePermissionMicroCamera() {
    return "ja".equals(l) ? "必要な権限" : "Permissions Required";
  }

  public static String messagePermissionMicroCamera() {
    return "ja".equals(l)
        ? "Brekeke Phone がマイク、カメラ、および通話を続行するためのその他の権限にアクセスできるようにします。"
        : "Allow Brekeke Phone to access the microphone, camera, and other permissions to continue"
            + " the call.";
  }

  public static String close() {
    return "ja".equals(l) ? "閉じる" : "Close";
  }

  public static String goToSetting() {
    return "ja".equals(l) ? "設定に移動" : "Go to settings";
  }

  public static String serviceIsRunning() {
    return "ja".equals(l) ? "サービスは実行中です" : "Service is running";
  }

  public static String serviceIsRunningInBackground() {
    return "ja".equals(l) ? "サービスはバックグラウンドで実行されています" : "Service is running in background";
  }
}
