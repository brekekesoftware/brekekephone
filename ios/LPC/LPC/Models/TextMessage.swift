import Foundation

public struct TextMessage: Codable, Routable {
    public var routing: Routing
    public var message: String

    public init(routing: Routing, message: String) {
        self.routing = routing
        self.message = message
    }
}
