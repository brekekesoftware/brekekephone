import Foundation

public struct Heartbeat: Codable {
  var count: Int64

  public init(count: Int64) {
    self.count = count
  }
}
