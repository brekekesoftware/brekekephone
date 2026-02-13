import AVFoundation
import WebRTC

@available(iOS 13.0, *)
class AudioSessionManager: NSObject {

  // MARK: - Properties

  static let shared = AudioSessionManager()
  private let logger = Logger(
    prependString: "AudioSessionManager",
    subsystem: .general
  )
  private var audioSession: AVAudioSession
  private var rtcAudioSession: RTCAudioSession
  private var lastKnownSpeaker = false
  private var isRecovering = false
  private final var rtcMode: AVAudioSession.Mode = .voiceChat
  private final var rtcCategory: AVAudioSession.Category = .playAndRecord
  private final var rtcCateOptions: AVAudioSession.CategoryOptions = [
    .allowBluetooth,
    .allowBluetoothA2DP,
    .duckOthers,
    .mixWithOthers
  ]

  // MARK: - Init / Deinit

  override init() {
    audioSession = AVAudioSession.sharedInstance()
    rtcAudioSession = RTCAudioSession.sharedInstance()
    super.init()
    rtcAudioSession.useManualAudio = true
    setupRTCAudioSession()
    addObservers()
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
  }

  // MARK: - Observers

  private func addObservers() {
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

  // MARK: - Public

  func setAudioActive(_ active: Bool, action: String = "", retryCount: Int = 0) {
    logger.log("⭐️ setAudioActive: \(active), isAudioEnabled:\(rtcAudioSession.isAudioEnabled), action: \(action), isOtherAudioPlaying:\(audioSession.isOtherAudioPlaying), lastKnownSpeaker:\(lastKnownSpeaker), retry:\(retryCount), isRecovering:\(isRecovering), isSpeaker:\(isSpeakerEnabled())")
    
    if isRecovering { return }
    
    guard active != rtcAudioSession.isAudioEnabled else { return }

    if active, audioSession.isOtherAudioPlaying {
      guard retryCount < 8 else {
        logger.log("⚠️ setAudioActive: max retries reached, proceeding anyway")
        activateAudio()
        return
      }
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
        self?.setAudioActive(active, action: action, retryCount: retryCount + 1)
      }
      return
    }

    if active {
      activateAudio()
    } else {
      deactivateAudio()
    }
  }

  func resetAVAudioConfig() {
    guard !rtcAudioSession.isAudioEnabled,
          audioSession.category != .playback || audioSession.mode != .default
    else { return }

    do {
      try audioSession.setCategory(.playback, mode: .default, options: [.mixWithOthers, .duckOthers])
      try audioSession.setActive(true)
    } catch {
      logger.log("resetAVAudioConfig error: \(error)")
    }
  }

  // MARK: - Audio Activation

  private func activateAudio() {
    do {
      rtcAudioSession.isAudioEnabled = false
      try audioSession.setActive(false, options: .notifyOthersOnDeactivation)
      ensureAudioSessionReady()
      try audioSession.setActive(true)
      rtcAudioSession.isAudioEnabled = true
      logger.log("setAudioActive = true - Success, lastKnownSpeaker: \(lastKnownSpeaker)")
      // Delay speaker override to let WebRTC audio engine settle
      // overrideOutputAudioPort is reset by any setCategory/setMode call
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
        self?.restoreSpeakerState()
      }
    } catch let error as NSError {
      logger.log("activateAudio error: \(error.code)")
    }
  }

  private func deactivateAudio() {
    do {
      rtcAudioSession.isAudioEnabled = false
      try audioSession.setActive(false, options: .notifyOthersOnDeactivation)
      if RNCallKeep.getConnectedCallsCount() == 0 {
        lastKnownSpeaker = false
      }
      logger.log("setAudioActive = false - Success, lastKnownSpeaker: \(lastKnownSpeaker)")
    } catch let error as NSError {
      logger.log("deactivateAudio error: \(error.code)")
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

  func isSpeakerEnabled() -> Bool {
    if isRecovering {
      return lastKnownSpeaker
    }
    return rtcAudioSession.currentRoute.outputs.contains { $0.portType == .builtInSpeaker }
  }

  // MARK: - Private

  private func setupRTCAudioSession() {
    rtcAudioSession.lockForConfiguration()
    defer { rtcAudioSession.unlockForConfiguration() }
    let config = RTCAudioSessionConfiguration.webRTC()
    config.categoryOptions = rtcCateOptions
    do {
      try rtcAudioSession.setConfiguration(config)
    } catch let error as NSError {
      logger.log("RTCAudioSession config error: \(error)")
    }
  }

  private func ensureAudioSessionReady() {
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
      } catch let error as NSError {
        logger.log("ensureAudioSessionReady error: \(error)")
      }
    }
  }

  private func restoreSpeakerState() {
    do {
      try audioSession.overrideOutputAudioPort(lastKnownSpeaker ? .speaker : .none)
      logger.log("🔊 Speaker restored: \(lastKnownSpeaker)")
    } catch {
      logger.log("restoreSpeakerState error: \(error)")
    }
  }

  // MARK: - Notification Handlers

  @objc private func handleAudioRouteChange(_ notification: Notification) {
    guard let userInfo = notification.userInfo,
          let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
          let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue)
    else { return }

    let isSpeakerOn = audioSession.currentRoute.outputs.first?.portType == .builtInSpeaker

    logger.log("🔀 RouteChange reason: \(reason.rawValue), speaker: \(isSpeakerOn), isAudioEnabled: \(rtcAudioSession.isAudioEnabled), mode: \(audioSession.mode), options: \(audioSession.categoryOptions), callConnected: \(RNCallKeep.getConnectedCallsCount())")

    if reason == .override, RNCallKeep.getConnectedCallsCount() != 0 {
      lastKnownSpeaker = isSpeakerOn
      logger.log("🔊 lastKnownSpeaker updated: \(lastKnownSpeaker)")
    }

     // Re-apply speaker after category change resets the override
//     if reason == .categoryChange, lastKnownSpeaker, !isSpeakerOn, rtcAudioSession.isAudioEnabled {
//       logger.log("🔊 categoryChange reset speaker, re-applying...")
//       restoreSpeakerState()
//     }
  }

  @objc private func handleInterruption(_ notification: Notification) {
    guard let userInfo = notification.userInfo,
          let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
          let type = AVAudioSession.InterruptionType(rawValue: typeValue)
    else { return }

    let source = userInfo["RNCallKeep_source"] as? String ?? "system"

    logger.log("Interruption \(type == .began ? "⚠️Began" : "✅Ended"), source: \(source), isOtherAudioPlaying: \(audioSession.isOtherAudioPlaying), 🔈Speaker:\(isSpeakerEnabled())")

    switch type {
    case .began:
      handleInterruptionBegan()
    case .ended:
      handleInterruptionEnded(source: source)
    @unknown default:
      break
    }
  }

  private func handleInterruptionBegan() {
    guard RNCallKeep.hasActiveUnholdBrekekeCall() else {
      logger.log("👌No active Brekeke call - skipping recovery")
      return
    }
    logger.log("🙏Active call interrupted - starting recovery, lastKnownSpeaker: \(lastKnownSpeaker)")
    recoverAudioSession()
  }

  private func handleInterruptionEnded(source: String) {
    guard RNCallKeep.hasActiveUnholdBrekekeCall() else { return }
    logger.log("🙏 Resuming audio session (source: \(source))")
    resumeAudioSession()
  }

  // MARK: - Recovery

  private func recoverAudioSession() {
    if isRecovering { return }
    isRecovering = true
    logger.log("🔄 Starting recovery via hold/unhold...")

    RNCallKeep.recoverAudioViaHoldUnhold()

    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
      guard let self = self else { return }
      self.isRecovering = false
      self.restoreSpeakerState()
    }
  }

  private func resumeAudioSession(withRetryCount retryCount: Int = 0) {
    guard retryCount < 8 else {
      logger.log("⚠️ Max retry attempts reached")
      return
    }

    do {
      rtcAudioSession.isAudioEnabled = false
      try audioSession.setActive(false, options: .notifyOthersOnDeactivation)
      try audioSession.setCategory(rtcCategory, mode: rtcMode, options: rtcCateOptions)
      try audioSession.setActive(true)
      rtcAudioSession.isAudioEnabled = true
      restoreSpeakerState()
      logger.log("✅ Audio session resumed")
    } catch {
      logger.log("Resume failed: \(error), retrying...")
      let delay = Double(retryCount + 1) * 1.0
      DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
        self?.resumeAudioSession(withRetryCount: retryCount + 1)
      }
    }
  }
}
