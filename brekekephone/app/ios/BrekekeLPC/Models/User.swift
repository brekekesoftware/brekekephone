import Foundation

public struct User: Codable, Equatable, Hashable {
  public var uuid: String
  public var uuid2: String
  public var deviceName: String
  public var appid = Settings.bundleIdentifier

  public init(uuid: String, uuid2: String, deviceName: String) {
    self.uuid = uuid
    self.uuid2 = uuid2
    self.deviceName = deviceName
  }

  public init(token: String, tokenVoip: String, username: String) {
    uuid = token + "$pn-gw@" + username
    uuid2 = tokenVoip + "$pn-gw@" + username + "@voip"
    deviceName = username
  }
}
