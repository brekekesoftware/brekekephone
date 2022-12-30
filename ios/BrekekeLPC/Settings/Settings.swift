import Foundation

public struct Settings: Codable, Equatable {
  struct PushManagerSettings: Codable, Equatable {
    var host = ""
    var port: UInt16 = 3000
    var localSsids: [String] = []
    var remoteSsids: [String] = []
    var tlsKeyHash = ""

    var mobileCountryCode = ""
    var mobileNetworkCode = ""
    var trackingAreaCode = ""

    var enabled = true
  }

  static var bundleIdentifier = "com.brekeke.phonedev"
  var pushManagerSettings = PushManagerSettings()
  var token: String
  var tokenVoip: String
  var username: String
}

extension Settings {
  var user: User {
    User(token: token, tokenVoip: tokenVoip, username: username)
  }
}

extension Settings.PushManagerSettings {
  // Convenience function that determines if the pushManagerSettings model has any valid
  // configuration properties set. A valid configuration
  // includes both a host value and an SSID or private LTE network configuration.
  var isEmpty: Bool {
    if host.isEmpty {
      return true
    }
    if (localSsids.isEmpty && remoteSsids.isEmpty) || mobileCountryCode
      .isEmpty || mobileNetworkCode.isEmpty {
      return true
    }
    return false
  }
}
