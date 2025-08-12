@objc(BrekekeEmitter)
class BrekekeEmitter : RCTEventEmitter {
  
  static weak var shared: BrekekeEmitter?
  
  @objc override init() {
    super.init()
    BrekekeEmitter.shared = self
  }
  
  override func supportedEvents() -> [String]! {
    return ["onAudioRouteChange"]
  }
  
  @objc static func emit(name: String, data: [String: Any]) {
    DispatchQueue.main.async {
      shared?.sendEvent(withName: name, body: data)
    }
  }
}
