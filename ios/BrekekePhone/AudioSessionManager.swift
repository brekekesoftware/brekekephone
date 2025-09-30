import AVFoundation
import WebRTC

@available(iOS 13.0, *)
class AudioSessionManager: NSObject {
  static let shared = AudioSessionManager()
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e0359a5e (Update reset audio and check audio category)
  private let logger = Logger(
    prependString: "AudioSessionManager",
    subsystem: .general
  )
<<<<<<< HEAD
  private var audioSession: AVAudioSession
  private var rtcAudioSession: RTCAudioSession
  private var output: [String: AVAudioSession.Port] = [:]
=======

  private var audioSession: AVAudioSession
  private var rtcAudioSession: RTCAudioSession
  private var output: [String: AVAudioSession.Port] = [:]
  private var firstRtcAudioActived = false
>>>>>>> 165d3a5e (update fix 1060,1061,1065,1078)
=======
  private var audioSession: AVAudioSession
  private var rtcAudioSession: RTCAudioSession
  private var output: [String: AVAudioSession.Port] = [:]
>>>>>>> e0359a5e (Update reset audio and check audio category)

  override init() {
    audioSession = AVAudioSession.sharedInstance()
    rtcAudioSession = RTCAudioSession.sharedInstance()
    super.init()
<<<<<<< HEAD
<<<<<<< HEAD
    rtcAudioSession.useManualAudio = true
    listenAudioSessionRoute()
    logger.log("initialized")
=======

    rtcAudioSession.useManualAudio = true
    listenAudioSessionRoute()
    firstRtcAudioActived = false
    print("AudioSessionManager: initialized")
>>>>>>> 165d3a5e (update fix 1060,1061,1065,1078)
=======
    rtcAudioSession.useManualAudio = true
    listenAudioSessionRoute()
    logger.log("initialized")
>>>>>>> e0359a5e (Update reset audio and check audio category)
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
  }

  func setupCorrectAudioConfiguration() {
<<<<<<< HEAD
<<<<<<< HEAD
    logger.log("setupCorrectAudioConfiguration")
    rtcAudioSession.lockForConfiguration()
    defer { rtcAudioSession.unlockForConfiguration() }
=======
    print("AudioSessionManager: setupCorrectAudioConfiguration")
    rtcAudioSession.lockForConfiguration()
    defer { rtcAudioSession.unlockForConfiguration() }

>>>>>>> 165d3a5e (update fix 1060,1061,1065,1078)
=======
    logger.log("setupCorrectAudioConfiguration")
    rtcAudioSession.lockForConfiguration()
    defer { rtcAudioSession.unlockForConfiguration() }
>>>>>>> e0359a5e (Update reset audio and check audio category)
    let configuration = RTCAudioSessionConfiguration.webRTC()
    configuration.categoryOptions = [
      .allowBluetooth,
      .allowBluetoothA2DP,
      .duckOthers,
      .mixWithOthers,
    ]

    do {
      try rtcAudioSession.setConfiguration(configuration)
<<<<<<< HEAD
<<<<<<< HEAD
      logger.log("setupCorrectAudioConfiguration completed")
    } catch {
      logger.log(
        "setupCorrectAudioConfiguration error: \(error)"
=======
      print("AudioSessionManager: setupCorrectAudioConfiguration completed")
    } catch {
      print(
        "AudioSessionManager: setupCorrectAudioConfiguration error: \(error)"
>>>>>>> 165d3a5e (update fix 1060,1061,1065,1078)
=======
      logger.log("setupCorrectAudioConfiguration completed")
    } catch {
      logger.log(
        "setupCorrectAudioConfiguration error: \(error)"
>>>>>>> e0359a5e (Update reset audio and check audio category)
      )
    }
  }

  func setAudioSessionActive(_ active: Bool) {
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
    print("AudioSessionManager: setAudioSessionActive: \(active)")
=======
    logger.log("setAudioSessionActive: \(active)")
>>>>>>> e0359a5e (Update reset audio and check audio category)
    rtcAudioSession.lockForConfiguration()
    defer { rtcAudioSession.unlockForConfiguration() }
    do {
      try rtcAudioSession.setActive(active)
      rtcAudioSession.isAudioEnabled = active
      logger.log("setAudioSessionActive completed")
    } catch {
      logger.log("setAudioSessionActive error: \(error)")
    }
<<<<<<< HEAD
    rtcAudioSession.unlockForConfiguration()
>>>>>>> 165d3a5e (update fix 1060,1061,1065,1078)
=======
>>>>>>> e0359a5e (Update reset audio and check audio category)
  }

  func resetAudioConfiguration() {
    do {
      try audioSession.setCategory(
<<<<<<< HEAD
<<<<<<< HEAD
        .playback,
        mode: .default,
        options: [.mixWithOthers]
      )
      try audioSession.setActive(true)
      logger.log("resetAudioConfiguration completed")
    } catch {
      logger.log("resetAudioConfiguration error: \(error)")
=======
        .playAndRecord,
=======
        .playback,
>>>>>>> e0359a5e (Update reset audio and check audio category)
        mode: .default,
        options: [.mixWithOthers]
      )
      try audioSession.setActive(true)
      logger.log("resetAudioConfiguration completed")
    } catch {
<<<<<<< HEAD
      print("AudioSessionManager: resetAudioConfiguration error: \(error)")
>>>>>>> 165d3a5e (update fix 1060,1061,1065,1078)
=======
      logger.log("resetAudioConfiguration error: \(error)")
>>>>>>> e0359a5e (Update reset audio and check audio category)
    }
  }

  func activateAudioSession() {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e0359a5e (Update reset audio and check audio category)
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
<<<<<<< HEAD
      setupCorrectAudioConfiguration()
=======
    print("AudioSessionManager: activateAudioSession")
    if !firstRtcAudioActived {
      resetAudioConfiguration()
      setupCorrectAudioConfiguration()
      firstRtcAudioActived = true
>>>>>>> 165d3a5e (update fix 1060,1061,1065,1078)
=======
      setupCorrectAudioConfiguration()
>>>>>>> e0359a5e (Update reset audio and check audio category)
    }
    setAudioSessionActive(true)
  }

  func deactivateAudioSession() {
<<<<<<< HEAD
<<<<<<< HEAD
    logger.log("deactivateAudioSession")
=======
    print("AudioSessionManager: deactivateAudioSession")
>>>>>>> 165d3a5e (update fix 1060,1061,1065,1078)
=======
    logger.log("deactivateAudioSession")
>>>>>>> e0359a5e (Update reset audio and check audio category)
    setAudioSessionActive(false)
  }

  func setAudioEnabled(_ enabled: Bool) {
<<<<<<< HEAD
<<<<<<< HEAD
    logger.log("setAudioEnabled: \(enabled)")
=======
    print("AudioSessionManager: setAudioEnabled: \(enabled)")
>>>>>>> 165d3a5e (update fix 1060,1061,1065,1078)
=======
    logger.log("setAudioEnabled: \(enabled)")
>>>>>>> e0359a5e (Update reset audio and check audio category)
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
<<<<<<< HEAD
<<<<<<< HEAD
      logger.log("Audio route changed to \(outputType)")
=======
      print("AudioSessionManager: Audio route changed to \(outputType)")
>>>>>>> 165d3a5e (update fix 1060,1061,1065,1078)
=======
      logger.log("Audio route changed to \(outputType)")
>>>>>>> e0359a5e (Update reset audio and check audio category)

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
<<<<<<< HEAD
<<<<<<< HEAD
      logger.log("No output found in current route")
=======
      print("AudioSessionManager: No output found in current route")
>>>>>>> 165d3a5e (update fix 1060,1061,1065,1078)
=======
      logger.log("No output found in current route")
>>>>>>> e0359a5e (Update reset audio and check audio category)
    }
  }
}
