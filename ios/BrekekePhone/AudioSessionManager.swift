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
  private var isRecovering = false
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
    logger
      .log(
        "setAudioActive: \(active),isAudioEnabled:\(rtcAudioSession.isAudioEnabled) action: \(action), isOtherAudioPlaying:\(audioSession.isOtherAudioPlaying)"
      )
    if active == rtcAudioSession.isAudioEnabled {
      return
    }

    do {
      if active {
        ensureAudioSessionReady()
        try audioSession.setActive(true)
        rtcAudioSession.isAudioEnabled = true
      } else {
        rtcAudioSession.isAudioEnabled = false
        try audioSession.setActive(false, options: .notifyOthersOnDeactivation)
      }
      logger.log("setAudioActive = \(active) - Success")
    } catch let error as NSError {
      logger
        .log("setAudioActive = \(active) error: \(error), code: \(error.code)")
    }
  }

  // Helper function to ensure AVAudioSession is ready
  private func ensureAudioSessionReady() {
    // Check if category and mode are correct
    let needsConfig = audioSession.category != rtcCategory
      || audioSession.mode != rtcMode

    if needsConfig {
      logger.log("⚠️ AVAudioSession not ready, re-configuring...")
      do {
        try audioSession.setCategory(
          rtcCategory,
          mode: rtcMode,
          options: rtcCateOptions
        )
        logger.log("AVAudioSession re-configured")
      } catch let error as NSError {
        logger.log("EnsureAudioSessionReady error: \(error)")
      }
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
    } catch let error as NSError {
      logger.log("Audio config error: \(error)")
    }
  }

  func isSpeakerEnabled() -> Bool {
    let currentOutputs = rtcAudioSession.currentRoute.outputs
    let isSpeaker = currentOutputs.contains { $0.portType == .builtInSpeaker }
    return isSpeaker
  }

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
        } catch let error as NSError {
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

  func restartWebRTCAudio() {
    rtcAudioSession.lockForConfiguration()
    defer { rtcAudioSession.unlockForConfiguration() }

    rtcAudioSession.isAudioEnabled = false
    rtcAudioSession.isAudioEnabled = true
    logger.log("WebRTC audio unit force restarted")
  }

  func handleSpeakerInterruption() {
    do {
      if restoreSpeakerInterruption {
        try audioSession.overrideOutputAudioPort(.speaker)
      } else {
        try audioSession.overrideOutputAudioPort(.none)
      }
    } catch let error as NSError {
      logger.log("overrideOutputAudioPort error: \(error)")
    }
    restoreSpeakerInterruption = false
  }

  func resumeAudioSession(withRetryCount retryCount: Int = 0) {
    // Prevent excessive retries
    guard retryCount < 8 else {
      logger.log("⚠️ Max retry attempts reached - giving up")
      return
    }
    
    logger.log("resumeAudioSession - attempt \(retryCount + 1)")
    
    // Step 1: Deactivate old session
    deactivateAudioSession()
    
    // Step 2: Reconfigure and activate
    do {
      try configureAndActivateAudioSession()
      onResumeSuccess()
    } catch {
      handleResumeError(error as NSError, retryCount: retryCount)
    }
  }
  
  private func deactivateAudioSession() {
    do {
      try audioSession.setActive(false, options: .notifyOthersOnDeactivation)
      rtcAudioSession.isAudioEnabled = false
      logger.log("Audio session deactivated")
    } catch {
      // Non-critical error - continue with resume attempt
      logger.log("Deactivate error (ignored): \(error)")
    }
  }
  
  private func configureAndActivateAudioSession() throws {
    try audioSession.setCategory(
      rtcCategory,
      mode: rtcMode,
      options: rtcCateOptions
    )
    try audioSession.setActive(true)
  }
  
  private func onResumeSuccess() {
    restartWebRTCAudio()
    handleSpeakerInterruption()
    logger.log("✅ Audio session resumed successfully")
  }
  
  private func handleResumeError(_ error: NSError, retryCount: Int) {
    logger.log(
      "Resume failed: \(error.localizedDescription) (code: \(error.code))"
    )
    
    // Schedule retry with exponential backoff
    let delay = Double(retryCount + 1) * 1.0
    logger.log("⏱️ Retrying in \(delay)s...")
    
    DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
      self?.resumeAudioSession(withRetryCount: retryCount + 1)
    }
  }

  @objc func handleInterruption(_ notification: Notification) {
    guard let userInfo = notification.userInfo,
          let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
          let type = AVAudioSession.InterruptionType(rawValue: typeValue)
    else { return }

    let source = userInfo["RNCallKeep_source"] as? String ?? "system"

    logger.log(
      "Interruption \(type == .began ? "Began" : "Ended"), source: \(source), isOtherAudioPlaying: \(audioSession.isOtherAudioPlaying)"
    )

    switch type {
    case .began:
      handleInterruptionBegan()
    case .ended:
      handleInterruptionEnded(source: source)
    @unknown default:
      logger.log("⚠️ Unknown interruption type: \(typeValue)")
    }
  }

  private func handleInterruptionBegan() {
    // Early return if no active call
    guard RNCallKeep.hasActiveUnholdBrekekeCall() else {
      logger.log("No active Brekeke call - skipping recovery")
      return
    }

    logger.log("Active call detected - preparing recovery")

    // Cache speaker state before recovery
    restoreSpeakerInterruption = audioSession.currentRoute.outputs
      .first?.portType == .builtInSpeaker

    recoverAudioSession()
  }

  private func handleInterruptionEnded(source: String) {
    guard source == "ResumeAudioSession" else {
      logger.log("Interruption ended from \(source) - no action needed")
      return
    }

    logger.log("Resuming audio session...")
    resumeAudioSession()
  }

  private func recoverAudioSession() {
    // Prevent duplicate recovery
    if isRecovering {
      logger.log("⚠️ Recovery already in progress - skipping")
      return
    }
    isRecovering = true
    logger.log("🔄 Starting audio session recovery via hold/unhold...")
    // Trigger hold/unhold via CallKit - this is what works!
    RNCallKeep.recoverAudioViaHoldUnhold()

    // Reset flag after delay
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
      self.isRecovering = false
      self.handleSpeakerInterruption()
    }
  }
}
