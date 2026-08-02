package com.brekeke.phonedev.lpc

class LpcModel {
  inner class User(token: String, token2: String, userName: String) {
    var uuid: String = "$token\$pn-gw@$userName"
    var uuid2: String = "$token2\$pn-gw@$userName@voip"
    var deviceName: String = userName
    val appid: String = "22177122297"
  }

  inner class Settings {
    var host: String? = null
    var port: Int = 0
    var tlsKeyHash: String = ""
    var localSsids: String? = null
    var remoteSsids: ArrayList<String>? = null
    var mobileCountryCode: String = ""
    var mobileNetworkCode: String = ""
    var trackingAreaCode: String = ""
    var enabled: Boolean = true
    var token: String? = null
    var userName: String? = null

    constructor(host: String?, port: Int, tlsKeyHash: String, token: String?, userName: String?) {
      this.host = host
      this.port = port
      this.tlsKeyHash = tlsKeyHash
      this.token = token
      this.userName = userName
    }

    constructor(
        host: String?,
        port: Int,
        tlsKeyHash: String,
        token: String?,
        userName: String?,
        remoteSsids: ArrayList<String>?,
    ) {
      this.host = host
      this.port = port
      this.tlsKeyHash = tlsKeyHash
      this.token = token
      this.userName = userName
      this.remoteSsids = remoteSsids
    }
  }
}
