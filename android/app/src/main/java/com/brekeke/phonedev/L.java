package com.brekeke.phonedev;

public class L {
  public static String l = null;

  public static String unlock() {
    return l.equals("ja") ? "ロック解除" : "UNLOCK";
  }

  public static String nCallsInBackground(int n) {
    return n
        + (l.equals("ja")
            ? " 他の通話はバックグランドにあります"
            : (" OTHER CALL" + (n > 1 ? "S ARE" : " IS") + " IN BACKGROUND"));
  }

  public static String incomingCall() {
    return l.equals("ja") ? "着信" : "Incoming Call";
  }

  public static String connecting() {
    return l.equals("ja") ? "接続中..." : "Connecting...";
  }

  public static String transfer() {
    return l.equals("ja") ? "転送" : "TRANSFER";
  }

  public static String park() {
    return l.equals("ja") ? "パーク" : "PARK";
  }

  public static String video() {
    return l.equals("ja") ? "ビデオ" : "VIDEO";
  }

  public static String speaker() {
    return l.equals("ja") ? "スピーカー" : "SPEAKER";
  }

  public static String mute() {
    return l.equals("ja") ? "ミュート" : "MUTE";
  }

  public static String unmute() {
    return l.equals("ja") ? "ミュート解除" : "UNMUTE";
  }

  public static String record() {
    return l.equals("ja") ? "録音" : "RECORD";
  }

  public static String dtmf() {
    return l.equals("ja") ? "DTMF" : "DTMF";
  }

  public static String hold() {
    return l.equals("ja") ? "保留" : "HOLD";
  }

  public static String unhold() {
    return l.equals("ja") ? "保留解除" : "UNHOLD";
  }

  public static String callIsOnHold() {
    return l.equals("ja") ? "保留中" : "CALL IS ON HOLD";
  }
}
