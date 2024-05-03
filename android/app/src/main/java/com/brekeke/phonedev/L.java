package com.brekeke.phonedev;

public class L {
  public static String l = null;

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
            + " to the call.";
  }

  public static String titlePermissionSetDefaultPhoneApp() {
    return "ja".equals(l) ? "必要な権限" : "Set Default Phone App";
  }

  public static String close() {
    return "ja".equals(l) ? "閉じる" : "Close";
  }

  public static String goToSetting() {
    return "ja".equals(l) ? "設定に移動" : "Go to settings";
  }
}
