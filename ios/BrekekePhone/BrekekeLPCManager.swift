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
  public var pushManager: NEAppPushManager?
  private let pushManagerDescription = "BrekekeLPCExtension"
  private let pushProviderBundleIdentifier =
    Settings.bundleIdentifier + ".BrekekeLPCExtension"
  private var cancellables = Set<AnyCancellable>()

  override init() {
    super.init()
    // create, update, or delete the push manager when
    // receiving new value from SettingsManager.hostSSIDPublisher
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
        if pushManagerSettings.isEmpty {
          self.logger.log("pushManagerSettings.isEmpty true")
        }
        if !pushManagerSettings.isEmpty, pushManagerSettings.enabled {
          var pm = pushManager ?? NEAppPushManager()
          pm.delegate = BrekekeLPCManager.shared
          self.logger.log("pm.delegate = nil? \(pm.delegate == nil)")
          // create a new push manager or update the existing instance with the
          // new values from settings
          logger.log("Saving new push manager configuration.")
          publisher = save(
            pushManager: pm,
            with: pushManagerSettings
          )
          .flatMap { pushManager -> AnyPublisher<
            NEAppPushManager,
            Error
          > in
            // reload the push manager
            pushManager.delegate = BrekekeLPCManager.shared
            self.logger
              .log("pushManager.delegate = nil? \(pushManager.delegate == nil)")
            logger
              .log("Loading new push manager configuration.")
            loadPushManager()
            return pushManager.load()
          }
          .map { $0 }
          .eraseToAnyPublisher()
          logger.log("Saving new push \(String(describing: publisher))")
        } else if let pushManager = pushManager {
          // remove the push manager and map its value to nil to indicate
          // removal of the push manager to the downstream subscribers
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
          logger
            .log(
              "BrekekeLPCManager::success::\(String(describing: pushManager))"
            )
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
    loadPushManager()
  }

  private func loadPushManager() {
    logger.log("Loading existing push manager.")

    // it is important to call loadAllFromPreferences as early as possible
    // during app initialization in order to set the delegate on
    // your NEAppPushManagers
    // this allows your NEAppPushManagers to receive an incoming call
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
      // the manager's delegate must be set synchronously in this closure in
      // order to avoid race conditions when the app launches in response
      // to an incoming call
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
    // store configuration so it can be retrieved later in Extension
    pushManager.providerConfiguration = [
      "host": pushManagerSettings.host,
      "port": pushManagerSettings.port,
      "tlsKeyHash": pushManagerSettings.tlsKeyHash,
    ]
    // set wifi matches
    pushManager.matchSSIDs = !pushManagerSettings.remoteSsids
      .isEmpty ? pushManagerSettings.remoteSsids : pushManagerSettings
      .localSsids
    // set LTE matches (currently not using)
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

extension String {
  func match(_ regex: String) -> [[String]] {
    let nsString = self as NSString
    return (try? NSRegularExpression(pattern: regex, options: []))?
      .matches(in: self, options: [],
               range: NSMakeRange(0, nsString.length)).map { match in
        (0 ..< match.numberOfRanges)
          .map {
            match.range(at: $0).location == NSNotFound ? "" : nsString
              .substring(with: match.range(at: $0))
          }
      } ?? []
  }
}

extension BrekekeLPCManager: NEAppPushDelegate {
  func appPushManager(
    _: NEAppPushManager,
    didReceiveIncomingCallWithUserInfo userInfo: [AnyHashable: Any] = [:]
  ) {
    guard let payload = userInfo["payload"] as? [AnyHashable: Any] else {
      logger.log("userInfo dictionary is missing a required field")
      return
    }
    // handle chat message
    guard payload["x_pn-id"] is String else {
      let content = UNMutableNotificationContent()
      let body = payload["body"] as! String
      let matched = body.match("from (.*?):(.*?)$")
      if let firstMatch = matched.first,
         let title = firstMatch.indices.contains(1) ? firstMatch[1] : nil {
        content.title = title
      } else if let senderUserName = payload["senderUserName"] as? String {
        content.title = senderUserName
      } else {
        content.title = ""
      }
      content.body = body
      content.sound = .default
      content.userInfo = payload
      content.sound = UNNotificationSound.default
      let trigger = UNTimeIntervalNotificationTrigger(
        timeInterval: 2.0,
        repeats: false
      )
      let request = UNNotificationRequest(
        identifier: UUID().uuidString,
        content: content,
        trigger: trigger
      )
      UNUserNotificationCenter.current().add(request) { [weak self] error in
        if let error = error {
          self?.logger.log("Error submitting local notification: \(error)")
          return
        }
        self?.logger.log("Local notification posted successfully")
      }
      return
    }
    // handle PN call
    guard let uuid = payload["callkeepUuid"] as? String, uuid != nil else {
      logger
        .log("userInfo dictionary is missing a required callkeepUuid field ")
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
