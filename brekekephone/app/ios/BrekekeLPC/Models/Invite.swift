import Foundation

public struct Invite: Codable, Routable {
  public var routing: Routing
  public var message: String
  public init(routing: Routing) {
    self.routing = routing
    message = ""
  }
}
