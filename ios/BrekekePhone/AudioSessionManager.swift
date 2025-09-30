import AVFoundation
import WebRTC

@available(iOS 13.0, *)
class AudioSessionManager: NSObject {
  static let shared = AudioSessionManager()
  private let logger = Logger(
    prependString: "AudioSessionManager",
    subsystem: .general
  )
  private var audioSession: AVAudioSession
  private var rtcAudioSession: RTCAudioSession
  private var output: [String: AVAudioSession.Port] = [:]

  override init() {
    audioSession = AVAudioSession.sharedInstance()
    rtcAudioSession = RTCAudioSession.sharedInstance()
    super.init()
    rtcAudioSession.useManualAudio = true
    listenAudioSessionRoute()
    logger.log("initialized")
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
  }

  func setupCorrectAudioConfiguration() {
    logger.log("setupCorrectAudioConfiguration")
    rtcAudioSession.lockForConfiguration()
    defer { rtcAudioSession.unlockForConfiguration() }
    let configuration = RTCAudioSessionConfiguration.webRTC()
    configuration.categoryOptions = [
      .allowBluetooth,
      .allowBluetoothA2DP,
      .duckOthers,
      .mixWithOthers,
    ]

    do {
      try rtcAudioSession.setConfiguration(configuration)
      logger.log("setupCorrectAudioConfiguration completed")
    } catch {
      logger.log(
        "setupCorrectAudioConfiguration error: \(error)"
      )
    }
  }

  func setAudioSessionActive(_ active: Bool) {
    logger.log("setAudioSessionActive: \(active)")
    rtcAudioSession.lockForConfiguration()
    defer { rtcAudioSession.unlockForConfiguration() }
    do {
      try rtcAudioSession.setActive(active)
      rtcAudioSession.isAudioEnabled = active
      logger.log("setAudioSessionActive completed")
    } catch {
      logger.log("setAudioSessionActive error: \(error)")
    }
  }

  func resetAudioConfiguration() {
    do {
      try audioSession.setCategory(
        .playback,
        mode: .default,
        options: [.mixWithOthers]
      )
      try audioSession.setActive(true)
      logger.log("resetAudioConfiguration completed")
    } catch {
      logger.log("resetAudioConfiguration error: \(error)")
    }
  }

  func activateAudioSession() {
    logger.log("activateAudioSession")
    logger.log("rtcAudioSession.category: \(rtcAudioSession.category)")
    let needsConfiguration = rtcAudioSession.category != AVAudioSession.Category
      .playAndRecord.rawValue ||
      !rtcAudioSession.categoryOptions.contains([
        .allowBluetooth,
        .allowBluetoothA2DP,
        .duckOthers,
        .mixWithOthers,
      ])

    if needsConfiguration {
      logger.log("needsConfiguration")
      setupCorrectAudioConfiguration()
    }
    setAudioSessionActive(true)
  }

  func deactivateAudioSession() {
    logger.log("deactivateAudioSession")
    setAudioSessionActive(false)
  }

  func setAudioEnabled(_ enabled: Bool) {
    logger.log("setAudioEnabled: \(enabled)")
    if enabled {
      activateAudioSession()
    } else {
      deactivateAudioSession()
    }
  }

  private func listenAudioSessionRoute() {
    NotificationCenter.default.removeObserver(
      self,
      name: AVAudioSession.routeChangeNotification,
      object: nil
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleAudioRouteChange(_:)),
      name: AVAudioSession.routeChangeNotification,
      object: nil
    )
  }

  @objc private func handleAudioRouteChange(_: Notification) {
    if let o = audioSession.currentRoute.outputs.first {
      let outputType = o.portType.rawValue
      logger.log("Audio route changed to \(outputType)")

      if !output.isEmpty && output["output"] == o.portType {
        return
      }
      output["output"] = o.portType
      BrekekeEmitter.emit(
        name: "onAudioRouteChange",
        data: ["isSpeakerOn": o.portType == .builtInSpeaker]
      )
    } else {
      output.removeAll()
      logger.log("No output found in current route")
    }
  }
}
