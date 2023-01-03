import Combine
import Foundation
import Network

class BaseChannel {
  private enum ConnectAction {
    case connect(NewConnection)
    case disconnect
  }

  var state: NetworkSession.State {
    stateSubject.value
  }

  private(set) lazy var messagePublisher: AnyPublisher<Codable, Never> =
    internalMessageSubject.dropNil()
  private(set) lazy var statePublisher: AnyPublisher<NetworkSession.State,
    Never> = stateSubject.eraseToAnyPublisher(
  )
  private let networkSession = RequestResponseSession()
  private let heartbeatMonitor: HeartbeatMonitor
  private let shouldConnectToServerSubject = CurrentValueSubject<Bool,
    Never>(false)
  private let stateSubject = CurrentValueSubject<NetworkSession.State,
    Never>(.disconnected)
  private let registrationSubject = CurrentValueSubject<User?, Never>(nil)
  private let internalMessageSubject = CurrentValueSubject<Codable?,
    Never>(nil)
  private var cancellables = Set<AnyCancellable>()
  private let logger: Logger

  public struct NewConnection: Equatable {
    public var port: UInt16
    public var host: String
    public var tlsKeyHash: String
    public init(port: UInt16, host: String, tlsKeyHash: String) {
      self.port = port
      self.host = host
      self.tlsKeyHash = tlsKeyHash
    }
  }

  private let hostSubject = CurrentValueSubject<NewConnection,
    Never>(
    NewConnection(
      port: 3000,
      host: "apps.brekeke.com",
      tlsKeyHash: ""
    )
  )

  init(heartbeatTimeout: DispatchTimeInterval, logger: Logger) {
    self.logger = logger
    networkSession.logger = logger
    heartbeatMonitor = HeartbeatMonitor(
      interval: heartbeatTimeout,
      logger: Logger(prependString: "Heartbeat Monitor",
                     subsystem: .heartbeat)
    )
    // Observe the network session's state changes and react.
    networkSession.statePublisher
      .combineLatest(registrationSubject)
      .sink { [weak self] state, registration in
        guard let self = self else {
          return
        }
        switch state {
        case .connected:
          self.heartbeatMonitor.session = self.networkSession
          do {
            try self.heartbeatMonitor.start()
          } catch {
            self.logger.log("Unable to start heartbeat monitor")
          }
          self.logger.log("registration:: \(registration)")
          if let registration = registration {
            self.request(message: registration)
          }
        case .disconnected:
          self.heartbeatMonitor.stop()
        default:
          break
        }
        self.stateSubject.send(state)
      }
      .store(in: &cancellables)

    // Observe messages from the network session and send them out on messagesSubject.
    networkSession.messagePublisher
      .compactMap { $0 }
      .subscribe(internalMessageSubject)
      .store(in: &cancellables)

    // Observe changes to the `connectActionPublisher` and connect or disconnect the
    // session accordingly.
    connectActionPublisher
      .sink { [weak self] connectAction in
        guard let self = self else {
          return
        }
        switch connectAction {
        case let .connect(conn):
          let connection = self.setupNewConnection(
            host: conn.host,
            port: conn.port,
            tlsKeyHash: conn.tlsKeyHash
          )
          self.networkSession.connect(connection: connection)
        case .disconnect:
          self.logger.log("Calling network session disconnect")
          self.networkSession.disconnect()
        }
      }
      .store(in: &cancellables)
  }

  private func setupNewConnection(
    host: String,
    port: UInt16,
    tlsKeyHash: String
  ) -> NWConnection {
    var tls: NWProtocolTLS.Options?
    if !tlsKeyHash.isEmpty {
      tls = ConnectionOptions.TLS.Client(publicKeyHash: tlsKeyHash).options
    }
    let parameters = NWParameters(
      tls: tls,
      tcp: ConnectionOptions.TCP.options
    )
    let protocolFramer = NWProtocolFramer
      .Options(definition: LengthPrefixedFramer.definition)
    parameters.defaultProtocolStack.applicationProtocols.insert(
      protocolFramer,
      at: 0
    )
    let connection = NWConnection(
      host: NWEndpoint.Host(host),
      port: NWEndpoint.Port(rawValue: port)!,
      using: parameters
    )
    connection.betterPathUpdateHandler = { isBetterPathAvailable in
      self.logger
        .log("A better path is available: \(isBetterPathAvailable)")
      guard isBetterPathAvailable else {
        return
      }
      // Disconnect the network session if a better path is available. In this case, the
      // retry logic in connectActionPublisher
      // takes care of reestablishing the connection over a viable interface.
      self.networkSession.disconnect()
    }
    return connection
  }

  // MARK: - Publishers

  // A publisher that signals whether the subscriber connects to the server or
  // disconnects an existing connection. This publisher takes
  // multiple variables into account, such as the network session's current state,
  // whether this class's connect/disconnect method resulted
  // from an external call, and whether the host changed.
  private lazy var connectActionPublisher: AnyPublisher<
    ConnectAction,
    Never
  > =
    networkSession.statePublisher
      .combineLatest(
        shouldConnectToServerSubject,
        hostSubject.removeDuplicates()
      )
      .scan(nil) { last, next -> (conn: NewConnection, connect: Bool?)? in
        let (networkSessionState, shouldConnectToServer, conn) = next
        var connect: Bool?

        if shouldConnectToServer, !conn.host.isEmpty {
          switch networkSessionState {
          case .connecting, .connected:
            guard last?.conn != conn else {
              break
            }
            // Disconnect if the host changed and the network session is in the connecting
            // or connected state. When network session's
            // state transitions to .disconnected, the next case causes the channel
            // to try to reconnect.
            connect = false
          case .disconnected:
            // Connect if the server is currently disconnected (retry).
            connect = true
          default:
            break
          }
        } else {
          switch networkSessionState {
          case .connected, .connecting:
            // Disconnect if the user wants to be disconnected and the session's state is
            // connected or connecting.
            connect = false
          default:
            break
          }
        }

        return (conn: conn, connect: connect)
      }
      .compactMap { value -> ConnectAction? in
        guard let value = value,
              let shouldConnect = value.connect else {
          // It's an indication from the upstream publisher to not proceed if
          // `value` or `value.connect` are nil.
          return nil
        }

        if shouldConnect {
          return .connect(value.conn)
        }

        return .disconnect
      }
      .eraseToAnyPublisher()

  // A publisher that upon subscription drops all states from the control channel
  // until receiving a `connected` state, waits for a
  // `disconnecting` state, then finishes.
  public func isDisconnectingPublisher()
    -> AnyPublisher<NetworkSession.State, Never> {
    statePublisher
      .drop { state -> Bool in
        state != .connected
      }
      .first(where: { state -> Bool in
        state == .disconnecting
      })
      .eraseToAnyPublisher()
  }

  // MARK: - Connection

  func connect() {
    shouldConnectToServerSubject.send(true)
  }

  func disconnect() {
    shouldConnectToServerSubject.send(false)
  }

  func setConnectionDetail(host: String, port: UInt16, tlsKeyHash: String) {
    logger
      .log(
        "setConnectionDetail host=\(host) port=\(port) tlsKeyHash=\(tlsKeyHash)"
      )
    hostSubject
      .send(NewConnection(port: port, host: host, tlsKeyHash: tlsKeyHash))
  }

  // MARK: - Registration

  func register(user: User) {
    registrationSubject.send(user)
  }

  // MARK: - Requests

  public func request<Message: Codable>(
    message: Message,
    completion: ((Result<Bool, Swift.Error>) -> Void)? = nil
  ) {
    networkSession.request(message: message, completion: completion)
  }

  public func requestPublisher<Message: Codable>(message: Message)
    -> (requestIdentifier: UInt32,
        publisher: AnyPublisher<Bool, Swift.Error>) {
    networkSession.requestPublisher(message: message)
  }

  // MARK: - Connection Health

  public func checkConnectionHealth() {
    heartbeatMonitor.evaluate()
  }
}
