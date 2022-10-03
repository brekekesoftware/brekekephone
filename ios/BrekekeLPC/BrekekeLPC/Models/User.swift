import Foundation

public struct User: Codable, Equatable, Hashable, Identifiable {
  public var uuid: UUID
  public var deviceName: String

  public var id: UUID {
    uuid
  }

  public init(uuid: UUID, deviceName: String) {
    self.uuid = uuid
    self.deviceName = deviceName
  }
}
public struct UserTest: Codable, Equatable, Hashable, Identifiable {
  public var uuid: String
  public var deviceName: String
  public var id: String {
      uuid
  }

  public init(uuid: String, deviceName: String) {
    self.uuid = uuid
    self.deviceName = deviceName
  }
}
// "8850a30427c8a0c532867abcd44f8aefad32feae041d2f5bc6e2aca146f441d3"
