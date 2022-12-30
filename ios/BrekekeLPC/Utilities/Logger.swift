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
    logger = os.Logger(
      subsystem: Settings.bundleIdentifier + ".lpc." + subsystem.rawValue,
      category: "Debug"
    )
  }

  public func log(_ message: String) {
    let prependString = prependString
    logger
      .log("\(prependString, privacy: .public): \(message, privacy: .public)")
  }
}
