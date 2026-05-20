package com.brekeke.phonedev.utils

// utils to support multiple languages
// see the related part in rn js for reference

object L {
  private var l: String? = null

  fun init() {
    try {
      set(Storage.locale())
    } catch (_: Exception) {}
  }

  fun set(newL: String?) {
    l = newL
    if (l == null) l = "en"
    if (l != "en" && l != "ja") l = "en"
  }

  fun loading(): String = if (l == "ja") "読込中..." else "Loading..."

  fun unlock(): String = if (l == "ja") "ロック解除" else "UNLOCK"

  fun nCallsInBackground(n: Int): String =
      n.toString() +
          if (l == "ja") " 他の通話はバックグランドにあります"
          else (" OTHER CALL" + (if (n > 1) "S ARE" else " IS") + " IN BACKGROUND")

  fun incomingCall(): String = if (l == "ja") "着信" else "Incoming Call"

  fun connecting(): String = if (l == "ja") "接続中..." else "Connecting..."

  fun transfer(): String = if (l == "ja") "転送" else "TRANSFER"

  fun park(): String = if (l == "ja") "パーク" else "PARK"

  fun video(): String = if (l == "ja") "ビデオ" else "VIDEO"

  fun speaker(): String = if (l == "ja") "スピーカー" else "SPEAKER"

  fun mute(): String = if (l == "ja") "ミュート" else "MUTE"

  fun unmute(): String = if (l == "ja") "ミュート解除" else "UNMUTE"

  fun record(): String = if (l == "ja") "録音" else "RECORD"

  fun dtmf(): String = if (l == "ja") "キーパッド" else "KEYPAD"

  fun hold(): String = if (l == "ja") "保留" else "HOLD"

  fun unhold(): String = if (l == "ja") "保留解除" else "UNHOLD"

  fun callIsOnHold(): String = if (l == "ja") "保留中" else "CALL IS ON HOLD"

  fun titlePermissionMicroCamera(): String = if (l == "ja") "必要な権限" else "Permissions Required"

  fun messagePermissionMicroCamera(): String =
      if (l == "ja") "Brekeke Phone がマイク、カメラ、および通話を続行するためのその他の権限にアクセスできるようにします。"
      else
          "Allow Brekeke Phone to access the microphone, camera, and other permissions to continue the call."

  fun close(): String = if (l == "ja") "閉じる" else "Close"

  fun goToSetting(): String = if (l == "ja") "設定に移動" else "Go to settings"

  fun serviceIsRunning(): String = if (l == "ja") "サービスは実行中です" else "Service is running"

  fun serviceIsRunningInBackground(): String =
      if (l == "ja") "サービスはバックグラウンドで実行されています" else "Service is running in background"
}
