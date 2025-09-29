import AVFoundation
import WebRTC

@available(iOS 13.0, *)
class AudioSessionManager: NSObject {
  static let shared = AudioSessionManager()

  private var audioSession: AVAudioSession
  private var rtcAudioSession: RTCAudioSession
  private var output: [String: AVAudioSession.Port] = [:]
  private var firstRtcAudioActived = false

  override init() {
    audioSession = AVAudioSession.sharedInstance()
    rtcAudioSession = RTCAudioSession.sharedInstance()
    super.init()

    rtcAudioSession.useManualAudio = true
    listenAudioSessionRoute()
    firstRtcAudioActived = false
    print("AudioSessionManager: initialized")
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
  }

  func setupCorrectAudioConfiguration() {
    print("AudioSessionManager: setupCorrectAudioConfiguration")
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
      print("AudioSessionManager: setupCorrectAudioConfiguration completed")
    } catch {
      print(
        "AudioSessionManager: setupCorrectAudioConfiguration error: \(error)"
      )
    }
  }

  func setAudioSessionActive(_ active: Bool) {
    print("AudioSessionManager: setAudioSessionActive: \(active)")
    rtcAudioSession.lockForConfiguration()
    do {
      try rtcAudioSession.setActive(active)
      rtcAudioSession.isAudioEnabled = active
      print("AudioSessionManager: setAudioSessionActive completed")
    } catch {
      print("AudioSessionManager: setAudioSessionActive error: \(error)")
    }
    rtcAudioSession.unlockForConfiguration()
  }

  func resetAudioConfiguration() {
    do {
      try audioSession.setCategory(
        .playAndRecord,
        mode: .default,
        options: [
          .allowBluetooth,
          .allowBluetoothA2DP,
          .duckOthers,
          .mixWithOthers,
        ]
      )
      try audioSession.setActive(true)
      print("AudioSessionManager: resetAudioConfiguration completed")
    } catch {
      print("AudioSessionManager: resetAudioConfiguration error: \(error)")
    }
  }

  func activateAudioSession() {
    print("AudioSessionManager: activateAudioSession")
    if !firstRtcAudioActived {
      resetAudioConfiguration()
      setupCorrectAudioConfiguration()
      firstRtcAudioActived = true
    }
    setAudioSessionActive(true)
  }

  func deactivateAudioSession() {
    print("AudioSessionManager: deactivateAudioSession")
    setAudioSessionActive(false)
  }

  func setAudioEnabled(_ enabled: Bool) {
    print("AudioSessionManager: setAudioEnabled: \(enabled)")
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
      print("AudioSessionManager: Audio route changed to \(outputType)")

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
      print("AudioSessionManager: No output found in current route")
    }
  }
}
