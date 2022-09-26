import Foundation

public struct Invite: Codable, Routable {
    public var routing: Routing

    public init(routing: Routing) {
        self.routing = routing
    }
}
