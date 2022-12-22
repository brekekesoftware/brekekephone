import Foundation

public struct Settings: Codable, Equatable {
  struct PushManagerSettings: Codable, Equatable {
    // TODO: LPC
    // arr string lưu 10 cái ssid gần nhất mà user dùng
    var localSsids: [String] = []
    // arr string lưu ssid từ server trả về
    var remoteSsids: [String] = []
    // TODO: LPC TLS
    var tlsKey = ""
    // TODO: LPC
    var port: UInt16 = 3000

    var mobileCountryCode = ""
    var mobileNetworkCode = ""
    var trackingAreaCode = ""
    var host = "apps.brekeke.com"
    var enabled = true
  }

  var appId: String
  var uuid: String
  var deviceName: String
  var pushManagerSettings = PushManagerSettings()
}

extension Settings {
  var user: User {
    User(uuid: uuid, deviceName: deviceName, appid: appId)
  }
}

extension Settings.PushManagerSettings {
  // Convenience function that determines if the pushManagerSettings model has any valid
  // configuration properties set. A valid configuration
  // includes both a host value and an SSID or private LTE network configuration.
  var isEmpty: Bool {
    // TODO: LPC
    // sửa lại logic, nếu cả 2 arr ở trên empty
    if (!localSsids
      .isEmpty && !remoteSsids.isEmpty) || (
      !mobileCountryCode.isEmpty && !mobileNetworkCode.isEmpty
    ),
      !host.isEmpty {
      return false
    } else {
      return true
    }
  }
}
