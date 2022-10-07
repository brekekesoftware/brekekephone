import Foundation

public struct User: Codable, Equatable, Hashable, Identifiable {
  public var uuid: String
  public var deviceName: String
  public var appid: String

  public var id: String {
    uuid
  }

  public init(uuid: String, deviceName: String, appid: String) {
    self.uuid = uuid
    self.deviceName = deviceName
    self.appid = appid
  }

//  public init(uuid: String, deviceName: String) {
//    self.uuid = uuid
//    self.deviceName = deviceName
//    self
//      .uuid = "a20a2ad59457ae42fd3a14a93241ea25074756ba26067d8cfd1604401a61fc11"
//    self.deviceName = "Nam iPhoneXs"
//    appid = "com.brekeke.phonedev"
//  }
}
