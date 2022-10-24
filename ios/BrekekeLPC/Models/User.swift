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
}
