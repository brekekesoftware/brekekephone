import Combine
import Foundation
import NetworkExtension

class BrekekeLPCManager: NSObject {
  public static let shared = BrekekeLPCManager()
  private var initialized = false

  private let dispatchQueue =
    DispatchQueue(label: "BrekekeLPCManager.dispatchQueue")
  private let logger = Logger(
    prependString: "BrekekeLPCManager",
    subsystem: .general
  )
  private var pushManager: NEAppPushManager?
  private let pushManagerDescription = "BrekekeLPCExtension"
  private let pushProviderBundleIdentifier =
    "com.brekeke.phonedev.BrekekeLPCExtension"
  private var cancellables = Set<AnyCancellable>()

  override init() {
    super.init()
//    // Observe settings published by the SettingsManager to update the SettingsView.
//    SettingsManager.shared.settingsPublisher
//        .receive(on: DispatchQueue.main)
//        .sink { [weak self] settings in
//          guard let self = self
//                 else {
//                   return
//                 }
////            self?.settings = settings
//          self.logger.log("settingsPublisher::setting::host:: \(settings.user.deviceName)")
//        }
//        .store(in: &cancellables)
//    
    // Check subcription setting
//    SettingsManager.shared.settingsPublisher
//      .sink { [weak self] settings in
//        guard let self = self
//        else {
//          return
//        }
//
////        self.logger.log("settingsPublisher::setting:: \(settings)")
//        self.logger.log("settingsPublisher::setting::host:: \(settings.user.deviceName)")
////        let user = User(uuid: settings.user.uuid,
////                        deviceName: settings.deviceName, appid: settings.appId)
////        self.channel.register(user)
////        self.channel.register(user)
////        self.channel.setHost(settings.pushManagerSettings.host)
//      }
//      .store(in: &cancellables)
    
    // Create, update, or delete the push manager when
    // SettingsManager.hostSSIDPublisher produces a new value.
    SettingsManager.shared.settingsDidWritePublisher
      .compactMap { settings in
        settings.pushManagerSettings
      }
      .removeDuplicates()
      .receive(on: dispatchQueue)
      .compactMap { [self] pushManagerSettings -> AnyPublisher<
        Result<NEAppPushManager?, Swift.Error>,
        Never
      >? in
        var publisher: AnyPublisher<NEAppPushManager?, Swift.Error>?

        if !pushManagerSettings.isEmpty {
          var pm = pushManager ?? NEAppPushManager()
          pm.delegate = BrekekeLPCManager.shared
          self.logger.log("pm.delegate = nil? \(pm.delegate == nil)")
          // Create a new push manager or update the existing instance with the new
          // values from settings.
          logger.log("Saving new push manager configuration.")
          publisher = save(
            pushManager: pm,
            with: pushManagerSettings
          )
          .flatMap { pushManager -> AnyPublisher<
            NEAppPushManager,
            Error
          > in
            // Reload the push manager.
            pushManager.delegate = BrekekeLPCManager.shared
            self.logger
              .log("pushManager.delegate = nil? \(pushManager.delegate == nil)")
            logger
              .log("Loading new push manager configuration.")
            return pushManager.load()
          }
          .map { $0 }
          .eraseToAnyPublisher()
          logger.log("Saving new push \(String(describing: publisher))")
        } else if let pushManager = pushManager {
          // Remove the push manager and map its value to nil to indicate removal of
          // the push manager to the downstream subscribers.
          logger.log("Removing push manager configuration.")
          pushManager.delegate = BrekekeLPCManager.shared
          self.logger
            .log("pushManager.delegate = nil? \(pushManager.delegate == nil)")
          publisher = pushManager.remove()
            .map { _ in nil }
            .eraseToAnyPublisher()
        }

        return publisher?.unfailable()
      }
      .switchToLatest()
      .receive(on: dispatchQueue)
      .sink { [self] result in
        switch result {
        case let .success(pushManager):
          logger.log("BrekekeLPCManager::success::\(String(describing: pushManager))")
          if let pushManager = pushManager {
            prepare(pushManager: pushManager)
          } else {
            cleanup()
          }
        case let .failure(error):
          logger.log("BrekekeLPCManager::failure::\(error)")
        }
      }.store(in: &cancellables)
  }

  func initialize() {
    if initialized {
      return
    }
    initialized = true

    logger.log("Loading existing push manager.")

    // It is important to call loadAllFromPreferences as early as possible during
    // app initialization in order to set the delegate on your
    // NEAppPushManagers. This allows your NEAppPushManagers to receive an incoming call.
    NEAppPushManager.loadAllFromPreferences { managers, error in
      if let error = error {
        self.logger
          .log("Failed to load all managers from preferences: \(error)")
        return
      }
      self.logger.log("loadAllFromPreferences length:\(managers?.count)")
      if let a = managers {
        for i in a {
          i.delegate = BrekekeLPCManager.shared
          self.logger.log("i.delegate = nil? \(i.delegate == nil)")
        }
      }

      guard let manager = managers?.first else {
        return
      }
      self.logger.log("to load all managers from preferences:")
      // The manager's delegate must be set synchronously in this closure in order
      // to avoid race conditions when the app launches in response
      // to an incoming call.
      manager.delegate = BrekekeLPCManager.shared
      self.logger.log("manager.delegate = nil? \(manager.delegate == nil)")

      self.dispatchQueue.async {
        self.prepare(pushManager: manager)
      }
    }
  }

  private func prepare(pushManager: NEAppPushManager) {
    logger.log("prepare")
    self.pushManager = pushManager
    if pushManager.delegate == nil {
      pushManager.delegate = BrekekeLPCManager.shared
    }
    logger.log("pushManager.delegate = nil? \(pushManager.delegate == nil)")
  }

  private func save(
    pushManager: NEAppPushManager,
    with pushManagerSettings: Settings.PushManagerSettings
  ) -> AnyPublisher<NEAppPushManager, Swift.Error> {
    pushManager.localizedDescription = pushManagerDescription
    pushManager.providerBundleIdentifier = pushProviderBundleIdentifier
    pushManager.delegate = BrekekeLPCManager.shared
    logger.log("pushManager.delegate = nil? \(pushManager.delegate == nil)")
    pushManager.isEnabled = true
    logger
      .log("pushProviderBundleIdentifier:\(pushManagerSettings)")
    // The provider configuration passes global variables; don't put user-specific
    // info in here (which could expose sensitive user info when
    // running on a shared iPad).
    pushManager.providerConfiguration = [
      "host": pushManagerSettings.host,
    ]

    if !pushManagerSettings.ssid.isEmpty {
      pushManager.matchSSIDs = [pushManagerSettings.ssid]
    } else {
      pushManager.matchSSIDs = []
    }

    if !pushManagerSettings.mobileCountryCode.isEmpty,
       !pushManagerSettings.mobileNetworkCode.isEmpty {
      let privateLTENetwork = NEPrivateLTENetwork()
      privateLTENetwork.mobileCountryCode = pushManagerSettings
        .mobileCountryCode
      privateLTENetwork.mobileNetworkCode = pushManagerSettings
        .mobileNetworkCode

      if !pushManagerSettings.trackingAreaCode.isEmpty {
        privateLTENetwork.trackingAreaCode = pushManagerSettings
          .trackingAreaCode
      } else {
        privateLTENetwork.trackingAreaCode = nil
      }

      pushManager.matchPrivateLTENetworks = [privateLTENetwork]
    } else {
      pushManager.matchPrivateLTENetworks = []
    }
    return pushManager.save()
  }

  private func cleanup() {
    pushManager = nil
  }
}

extension BrekekeLPCManager: NEAppPushDelegate {
  func appPushManager(
    _: NEAppPushManager,
    didReceiveIncomingCallWithUserInfo userInfo: [AnyHashable: Any] = [:]
  ) {
    logger.log("NEAppPushDelegate received an incoming call")
    guard let payload = userInfo["payload"] as? [AnyHashable: Any],
          let uuid = payload["callkeepUuid"] as? String else {
      logger.log("userInfo dictionary is missing a required field")
      return
    }
    AppDelegate.reportNewIncomingCall(
      uuid: uuid,
      payload: payload,
      handler: nil
    )
  }
}

extension NEAppPushManager {
  func load() -> AnyPublisher<NEAppPushManager, Error> {
    Future { [self] promise in
      loadFromPreferences { error in
        if let error = error {
          print("BrekekeLPCManager::Load:: \(error)")
          promise(.failure(error))
          return
        }
        promise(.success(self))
      }
    }
    .eraseToAnyPublisher()
  }

  func save() -> AnyPublisher<NEAppPushManager, Error> {
    Future { [self] promise in
      saveToPreferences { error in
        if let error = error {
          print("BrekekeLPCManager::save:: \(error)")
          promise(.failure(error))
          return
        }
        promise(.success(self))
      }
    }
    .eraseToAnyPublisher()
  }

  func remove() -> AnyPublisher<NEAppPushManager, Error> {
    Future { [self] promise in
      removeFromPreferences(completionHandler: { error in
        if let error = error {
          promise(.failure(error))
          return
        }
        promise(.success(self))
      })
    }
    .eraseToAnyPublisher()
  }
}
