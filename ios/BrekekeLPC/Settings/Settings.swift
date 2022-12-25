import Foundation

public struct Settings: Codable, Equatable {
  struct PushManagerSettings: Codable, Equatable {
    var host = "apps.brekeke.com"
    var port: UInt16 = 3000
    var localSsids: [String] = []
    var remoteSsids: [String] = []
    var tlsKeyHash = ""

    var mobileCountryCode = ""
    var mobileNetworkCode = ""
    var trackingAreaCode = ""

    var enabled = true
  }

  var appid = "com.brekeke.phonedev"
  var uuid: String
  var deviceName: String
  var pushManagerSettings = PushManagerSettings()
}

extension Settings {
  var user: User {
    User(uuid: uuid, deviceName: deviceName, appid: appid)
  }
}

extension Settings.PushManagerSettings {
  // Convenience function that determines if the pushManagerSettings model has any valid
  // configuration properties set. A valid configuration
  // includes both a host value and an SSID or private LTE network configuration.
  var isEmpty: Bool {
    if (!localSsids.isEmpty && !remoteSsids.isEmpty) || (
      !mobileCountryCode.isEmpty && !mobileNetworkCode.isEmpty
    ) || !host.isEmpty {
      return false
    } else {
      return true
    }
  }
}
