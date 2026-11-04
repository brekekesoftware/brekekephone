@objc(BrekekeEmitter)
class BrekekeEmitter: RCTEventEmitter {
  // native code posts here; the module sends only while JS listens,
  // so no static instance is needed (works on both architectures)
  static let notification = Notification.Name("BrekekeEmitterEvent")

  override func supportedEvents() -> [String]! {
    return ["onAudioRouteChange"]
  }

  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  override func startObserving() {
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(onNotification(_:)),
      name: BrekekeEmitter.notification,
      object: nil
    )
  }

  override func stopObserving() {
    NotificationCenter.default.removeObserver(self)
  }

  @objc func onNotification(_ n: Notification) {
    guard let name = n.userInfo?["name"] as? String else { return }
    sendEvent(withName: name, body: n.userInfo?["data"])
  }

  @objc static func emit(name: String, data: [String: Any]) {
    DispatchQueue.main.async {
      NotificationCenter.default.post(
        name: notification,
        object: nil,
        userInfo: ["name": name, "data": data]
      )
    }
  }
}
