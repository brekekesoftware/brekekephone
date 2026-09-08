import Combine
import Foundation
import NetworkExtension
import UserNotifications

class BrekekeLPCExtension: NEAppPushProvider {
  private let channel = BaseChannel(
    heartbeatTimeout: .seconds(30),
    logger: Logger(
      prependString: "Notification Channel",
      subsystem: .networking
    )
  )
  private var cancellables = Set<AnyCancellable>()
  private let logger = Logger(
    prependString: "BrekekeLPCExtension",
    subsystem: .general
  )

  override init() {
    super.init()

    logger.log("Initialized")

    // observe notification channel connection state for logging purposes
    channel.statePublisher
      .sink { [weak self] state in
        self?.logger.log("Notification channel state changed to: \(state)")
      }
      .store(in: &cancellables)

    // observe notification channel messages and alert the user when receiving
    // a new text message or call invite
    channel.messagePublisher
      .receive(on: DispatchQueue.main)
      .sink { [weak self] message in
        guard let self = self
        else {
          return
        }
        self.logger.log("message:\(message)")
        switch message {
        case let message as TextMessage:
          // brekeke server will send everything as TextMessage
          // we will check if it is a call or chat PN in BrekekeLPCManager
          // if it requires CallKit interaction, we must check here instead
          self.reportIncomingCall(userInfo: [
            "payload": message.custom,
          ])
        case let message as Invite:
          self.logger
            .log("error: currently server will not send message as Invite")
        default:
          break
        }
      }
      .store(in: &cancellables)

    // observe changes to Settings to send new user registrations on the
    // notification channel when receiving a Settings change
    SettingsManager.shared.settingsPublisher
      .sink { [weak self] settings in
        print("settingsPublisher::start::user1 ")
        self?.logger.log("settingsPublisher::start::user1 \(settings)")
        guard let self = self
        else {
          return
        }
        if !settings.pushManagerSettings.enabled {
          self.stop(with: NEProviderStopReason(rawValue: 5)!,
                    completionHandler: {})
          return
        }

        self.logger.log("settingsPublisher::start::user \(settings)")
        let user = User(uuid: settings.user.uuid,
                        uuid2: settings.user.uuid2,
                        deviceName: settings.user.deviceName)
        self.channel.setConnectionDetail(
          host: settings.pushManagerSettings.host,
          port: settings.pushManagerSettings.port,
          tlsKeyHash: settings.pushManagerSettings.tlsKeyHash
        )
        self.channel.register(user: user)
      }
      .store(in: &cancellables)
  }

  // MARK: - NEAppPushProvider Life Cycle

  override func start() {
    logger.log("Started")
    guard let host = providerConfiguration?["host"] as? String,
          let port = providerConfiguration?["port"] as? UInt16,
          let tlsKeyHash = providerConfiguration?["tlsKeyHash"] as? String
    else {
      logger.log("Provider configuration is missing value host/port/tlsKeyHash")
      return
    }
    channel.setConnectionDetail(host: host, port: port, tlsKeyHash: tlsKeyHash)
    channel.connect()
  }

  override func stop(
    with reason: NEProviderStopReason,
    completionHandler: @escaping () -> Void
  ) {
    logger.log("Stopped with reason \(reason)")
    channel.disconnect()
    completionHandler()
  }

  override func handleTimerEvent() {
    logger.log("Handle timer called")
    channel.checkConnectionHealth()
  }
}
