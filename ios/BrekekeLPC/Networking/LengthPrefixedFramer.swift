import Foundation
import Network

@available(macOSApplicationExtension 11.0, *)
public class LengthPrefixedFramer: NWProtocolFramerImplementation {
  private typealias Header = UInt32

  public static let label = "LengthPrefixedFramer"
  public static let definition = NWProtocolFramer
    .Definition(implementation: LengthPrefixedFramer.self)
  private let logger = Logger(
    prependString: "LengthPrefixedFramer",
    subsystem: .networking
  )

  public required init(framer _: NWProtocolFramer.Instance) {}

  public func start(framer _: NWProtocolFramer.Instance) -> NWProtocolFramer
    .StartResult {
    .ready
  }

  public func handleInput(framer: NWProtocolFramer.Instance) -> Int {
    let headerSize = MemoryLayout<Header>.size

    while true {
      var header: Header?

      let didParse = framer.parseInput(
        minimumIncompleteLength: headerSize,
        maximumLength: headerSize
      ) { buffer, _ -> Int in
        guard let buffer = buffer, buffer.count >= headerSize
        else {
          return 0
        }

        header = buffer.bindMemory(to: Header.self)[0]

        // advance the cursor the size of the header
        return headerSize
      }

      guard didParse, let messageLength = header
      else {
        return headerSize
      }

      let message = NWProtocolFramer
        .Message(definition: LengthPrefixedFramer.definition)
      if !framer.deliverInputNoCopy(
        length: Int(messageLength),
        message: message,
        isComplete: true
      ) {
        return 0
      }
    }
  }

  public func handleOutput(
    framer: NWProtocolFramer.Instance,
    message _: NWProtocolFramer.Message,
    messageLength: Int,
    isComplete _: Bool
  ) {
    do {
      var header = UInt32(messageLength)
      let headerData = withUnsafeBytes(of: &header) { buffer -> Data in
        Data(buffer: buffer.bindMemory(to: UInt8.self))
      }

      framer.writeOutput(data: headerData)
      try framer.writeOutputNoCopy(length: messageLength)
    } catch {
      logger.log("Error while writing output: \(error)")
    }
  }

  public func wakeup(framer _: NWProtocolFramer.Instance) {}

  public func stop(framer _: NWProtocolFramer.Instance) -> Bool {
    true
  }

  public func cleanup(framer _: NWProtocolFramer.Instance) {}
}
