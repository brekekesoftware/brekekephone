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
          if (l == "ja") " 他の通話はバックグラウンドにあります"
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

  fun serviceIsRunning(): String =
      if (l == "ja") "Brekeke Phoneは通話とメッセージの受信準備が整いました。"
      else "Brekeke Phone is ready to receive calls and messages"

  fun serviceIsRunningInBackground(): String =
      if (l == "ja") "ローカルプッシュ接続（LPC）で通話とメッセージを受信できる状態です。\n不要な場合は、アカウント設定で「プッシュ通知」を無効にしてください。"
      else
          "Fallback local connection is active. Tap to open. To stop: turn off Push Notification in" +
              " Account Settings."
}
