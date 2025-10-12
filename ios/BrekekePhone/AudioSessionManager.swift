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
  private var isActivatingAudio = false
  private var restoreSpeaker = false
  private var restoreSpeakerInterruption = false
  private final var rtcMode: AVAudioSession.Mode = .voiceChat
  private final var rtcCategory: AVAudioSession.Category = .playAndRecord
  private final var rtcCateOptions: AVAudioSession.CategoryOptions = [
    .allowBluetooth,
    .allowBluetoothA2DP,
    .duckOthers,
    .mixWithOthers,
  ]
  override init() {
    audioSession = AVAudioSession.sharedInstance()
    rtcAudioSession = RTCAudioSession.sharedInstance()
    super.init()
    rtcAudioSession.useManualAudio = true
    isActivatingAudio = false
    restoreSpeaker = false
    setupRTCAudioSession()
    listenAudioSessionRoute()
    logger.log("initialized")
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
  }

  func setAudioActive(_ active: Bool, action: String = "") {
    logger.log(" setAudioActive: \(active), action: \(action)")
    if active == rtcAudioSession.isAudioEnabled {
      return
    }
    // If activating audio, set flag to track activation state
    rtcAudioSession.lockForConfiguration()
    defer {
      rtcAudioSession.unlockForConfiguration()
    }
    do {
      try rtcAudioSession.setActive(active)
      rtcAudioSession.isAudioEnabled = active
    } catch {
      logger.log("Set active error: \(error)")
    }
  }

  func resetAVAudioConfig() {
    if rtcAudioSession
      .isAudioEnabled ||
      (audioSession.category == .playback && audioSession.mode == .default) {
      return
    }

    do {
      try audioSession.setCategory(
        .playback,
        mode: .default,
        options: [.mixWithOthers, .duckOthers]
      )
      try audioSession.setActive(true)
      logger.log("resetAVAudioConfig completed")
    } catch {
      logger.log("resetAVAudioConfig error: \(error)")
    }
  }

  func setupAVAdioSession(_ mode: AVAudioSession.Mode? = nil) {
    do {
      try audioSession.setCategory(
        rtcCategory,
        mode: mode ?? rtcMode,
        options: rtcCateOptions
      )
      try audioSession.setActive(true)
    } catch {
      logger.log("setupAVAdioSession error: \(error)")
    }
  }

  func setupRTCAudioSession() {
    rtcAudioSession.lockForConfiguration()
    defer {
      rtcAudioSession.unlockForConfiguration()
    }
    let config = RTCAudioSessionConfiguration.webRTC()
    config.categoryOptions = rtcCateOptions
    do {
      try rtcAudioSession.setConfiguration(config)
    } catch {
      logger.log("Audio config error: \(error)")
    }
  }

  func isSpeakerEnabled() -> Bool {
    let currentOutputs = rtcAudioSession.currentRoute.outputs
    let isSpeaker = currentOutputs.contains { $0.portType == .builtInSpeaker }
    return isSpeaker
  }

  // listener methods

  private func listenAudioSessionRoute() {
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleAudioRouteChange(_:)),
      name: AVAudioSession.routeChangeNotification,
      object: nil
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleInterruption(_:)),
      name: AVAudioSession.interruptionNotification,
      object: nil
    )
  }

  private func handleAudioActivation(
    reason: AVAudioSession.RouteChangeReason
  ) {
    // start process answer call
    if reason == .categoryChange,
       !isActivatingAudio,
       !rtcAudioSession.isAudioEnabled,
       audioSession.category == .playAndRecord,
       audioSession.mode == .default {
      logger.log(" ✅ start process answer call")
      isActivatingAudio = true
    }
    // end process answer call
    if reason == .categoryChange,
       isActivatingAudio,
       rtcAudioSession.isAudioEnabled,
       audioSession.category == .playAndRecord,
       audioSession.mode == .voiceChat || audioSession.mode == .videoChat {
      logger.log(" ✅ end process answer call")

      if restoreSpeaker {
        do {
          try audioSession.overrideOutputAudioPort(.speaker)
          logger.log(" ✅ restore Speaker to: \(restoreSpeaker)")
          restoreSpeaker = false
        } catch {
          logger.log("overrideOutputAudioPort error: \(error)")
        }
      }

      isActivatingAudio = false
    }
    let isSpeakerOn = audioSession.currentRoute.outputs.first?
      .portType == .builtInSpeaker
    // Track speaker state during activation
    if isActivatingAudio {
      restoreSpeaker = isSpeakerOn
    }
  }

  @objc private func handleAudioRouteChange(_ notification: Notification) {
    guard let userInfo = notification.userInfo,
          let reasonValue =
          userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
          let reason = AVAudioSession
          .RouteChangeReason(rawValue: reasonValue) else {
      return
    }

    let isSpeakerOn = rtcAudioSession.currentRoute.outputs.first?
      .portType == .builtInSpeaker
    logger
      .log(
        "handleAudioRouteChange speaker: \(isSpeakerOn), reason: \(reason.rawValue), isAudioEnabled: \(rtcAudioSession.isAudioEnabled), mode: \(audioSession.mode.rawValue), category: \(audioSession.category.rawValue), options: \(audioSession.categoryOptions)"
      )

    handleAudioActivation(reason: reason)
  }

  @objc func handleInterruption(_ notification: Notification) {
    guard let userInfo = notification.userInfo,
          let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
          let type = AVAudioSession.InterruptionType(rawValue: typeValue)
    else { return }

    if type == .began {
      if audioSession.isOtherAudioPlaying {
        restoreSpeakerInterruption = audioSession.currentRoute.outputs.first?
          .portType == .builtInSpeaker
        setAudioActive(false, action: "InterruptionBegan")
      }
    } else if type == .ended {
      if audioSession.isOtherAudioPlaying {
        do {
          try audioSession.setCategory(
            .playAndRecord,
            mode: .voiceChat,
            options: [
              .allowBluetooth,
              .allowBluetoothA2DP,
              .duckOthers,
              .mixWithOthers,
            ]
          )
          if restoreSpeakerInterruption {
            try audioSession.overrideOutputAudioPort(.speaker)
          } else {
            try audioSession.overrideOutputAudioPort(.none)
          }
          restoreSpeakerInterruption = false
          try audioSession.setActive(false)
        } catch {}
      }
    }
  }
}
