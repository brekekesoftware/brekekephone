import Foundation

public struct TextMessage: Codable, Routable {
  public var routing: Routing
  public var message: String
  private enum CodingKeys: String, CodingKey {
    case routing, message
  }

  public init(routing: Routing, message: String) {
    self.routing = routing
    self.message = message
  }

  public var custom: [AnyHashable: Any]?
}
