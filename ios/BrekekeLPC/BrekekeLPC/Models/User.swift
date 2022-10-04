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
    //a20a2ad59457ae42fd3a14a93241ea25074756ba26067d8cfd1604401a61fc11
  public init(uuid: String, deviceName: String) {
    self.uuid = uuid
    self.deviceName = deviceName
    self.uuid = "8850a30427c8a0c532867abcd44f8aefad32feae041d2f5bc6e2aca146f441d3"
    self.deviceName = "iPhoneX3"
    self.appid = "com.brekeke.phonedev"
  }
}
// public struct UserTest: Codable, Equatable, Hashable, Identifiable {
//   public var uuid: String
//   public var deviceName: String
//   public var id: String {
//       uuid
//   }

//   public init(uuid: String, deviceName: String) {
//     self.uuid = uuid
//     self.deviceName = deviceName
//   }
// }
// "8850a30427c8a0c532867abcd44f8aefad32feae041d2f5bc6e2aca146f441d3"
