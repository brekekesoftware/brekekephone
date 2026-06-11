import Foundation

public struct Directory: Codable {
  public var users: [User]

  public init(users: [User]) {
    self.users = users
  }
}
