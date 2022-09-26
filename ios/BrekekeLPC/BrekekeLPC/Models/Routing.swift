import Foundation

public struct Routing: Codable {
    public var sender: User
    public var receiver: User

    public init(sender: User, receiver: User) {
        self.sender = sender
        self.receiver = receiver
    }
}
