import Foundation

public struct Heartbeat: Codable {
  var count: Int64
    var hi:String
  public init(count: Int64) {
    self.count = count
      self.hi = ""
  }
}
