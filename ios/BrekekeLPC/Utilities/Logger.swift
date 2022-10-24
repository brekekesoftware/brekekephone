import Foundation
import os.log

@available(macOSApplicationExtension 11.0, *)
public class Logger {
  public enum Subsystem: String {
    case general
    case networking
    case heartbeat
    case callKit
  }

  private var prependString: String
  private var logger: os.Logger

  public init(prependString: String, subsystem: Subsystem) {
    self.prependString = prependString
    let bundleID = Bundle(for: type(of: self))
      .bundleIdentifier ?? "com.brekeke.phonedev.lpc"
    logger = os.Logger(
      subsystem: bundleID + "." + subsystem.rawValue,
      category: "Debug"
    )
  }

  public func log(_ message: String) {
    let prependString = prependString
    logger
      .log("\(prependString, privacy: .public): \(message, privacy: .public)")
  }
}
