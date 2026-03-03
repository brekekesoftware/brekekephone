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
  private final var rtcMode: AVAudioSession.Mode = .voiceChat
  private final var rtcCategory: AVAudioSession.Category = .playAndRecord
  private final var rtcCateOptions: AVAudioSession.CategoryOptions = [
    .allowBluetooth,
    .allowBluetoothA2DP,
//    .duckOthers,
//    .mixWithOthers
  ]

  // MARK: - Init / Deinit

  override init() {
    audioSession = AVAudioSession.sharedInstance()
    rtcAudioSession = RTCAudioSession.sharedInstance()
    super.init()
    logger
      .log(
        "⭐️ INIT  category:\(audioSession.category.rawValue), mode:\(audioSession.mode.rawValue), Option:\(audioSession.categoryOptions.rawValue), isOtherAudioPlaying:\(audioSession.isOtherAudioPlaying), Speaker: \(audioSession.currentRoute.outputs.contains { $0.portType == .builtInSpeaker })"
      )
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
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleAppDidEnterBackground),
      name: UIApplication.didEnterBackgroundNotification,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleAppDidBecomeActive),
      name: UIApplication.didBecomeActiveNotification,
      object: nil
    )
  }

  // MARK: - Public

  func resetAVAudioConfig() {
    let activeCalls = RNCallKeep.getAllCallsCount()
    let appState: UIApplication.State
    if Thread.isMainThread {
      appState = UIApplication.shared.applicationState
    } else {
      appState = DispatchQueue.main
        .sync { UIApplication.shared.applicationState }
    }
    guard appState == .active,
          activeCalls == 0,
          !rtcAudioSession.isAudioEnabled,
          audioSession.category != .playback || audioSession.mode != .default
    else {
      logger
        .log(
          "resetAVAudioConfig SKIP - appState:\(appState.rawValue), activeCalls:\(activeCalls), isAudioEnabled:\(rtcAudioSession.isAudioEnabled), category:\(audioSession.category.rawValue), mode:\(audioSession.mode.rawValue), isOtherApp:\(audioSession.isOtherAudioPlaying)"
        )
      return
    }
    logger.log("resetAVAudioConfig START")
    do {
      try audioSession.setCategory(
        .playback,
        mode: .default,
        options: [.mixWithOthers, .duckOthers]
      )
    } catch {
      logger.log("resetAVAudioConfig error: \(error)")
    }
  }

  func setAudioActive(
    _ isActive: Bool,
    action: String = ""
  ) {
    logger
      .log(
        "⭐️ setAudioActive: \(isActive), isAudioEnabled:\(rtcAudioSession.isAudioEnabled), action: \(action), isOtherAudioPlaying:\(audioSession.isOtherAudioPlaying), Speaker:\(isSpeakerEnabled()),  category:\(audioSession.category.rawValue), mode:\(audioSession.mode.rawValue), options:\(audioSession.categoryOptions.rawValue)"
      )

    guard isActive != rtcAudioSession.isAudioEnabled else { return }
    logger.log("🏁 start set active:\(isActive) audio")
    if isActive {
      rtcAudioSession.audioSessionDidActivate(audioSession)
    } else {
      rtcAudioSession.audioSessionDidDeactivate(audioSession)
    }
    rtcAudioSession.isAudioEnabled = isActive
    logger.log("🏁 finish set active:\(isActive) audio")
  }

  // MARK: - Audio Activation

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
    return audioSession.currentRoute.outputs
      .contains { $0.portType == .builtInSpeaker }
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

  func ensureAudioSessionReady() {
    let needsConfig = audioSession.category != rtcCategory
      || audioSession.mode != rtcMode
      || audioSession.categoryOptions != rtcCateOptions

    if needsConfig {
      do {
        try audioSession.setCategory(
          rtcCategory,
          mode: rtcMode,
          options: rtcCateOptions
        )
        logger
          .log(
            "✅ ensureAudioSessionReady: re-config SUCCESS - category:\(audioSession.category.rawValue), mode:\(audioSession.mode.rawValue), options:\(audioSession.categoryOptions.rawValue), output:\(audioSession.currentRoute.outputs.first?.portType.rawValue ?? "none")"
          )
      } catch let error as NSError {
        logger.log("❌ ensureAudioSessionReady error: \(error)")
      }
    } else {
      logger.log("👌 ensureAudioSessionReady: config already matches, skipping")
    }
  }

  // MARK: - Notification Handlers

  @objc private func handleAudioRouteChange(_ notification: Notification) {
    guard let userInfo = notification.userInfo,
          let reasonValue =
          userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
          let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue)
    else { return }

    let isSpeakerOn = audioSession.currentRoute.outputs.first?
      .portType == .builtInSpeaker

    logger
      .log(
        "🔀 RouteChange reason: \(reason.rawValue), speaker: \(isSpeakerOn), isOtherAudioPlaying:\(audioSession.isOtherAudioPlaying), isAudioEnabled: \(rtcAudioSession.isAudioEnabled), category:\(audioSession.category) ,mode: \(audioSession.mode), options: \(audioSession.categoryOptions), callConnected: \(RNCallKeep.getConnectedCallsCount())"
      )
    BrekekeEmitter.emit(
      name: "onAudioRouteChange",
      data: ["isSpeakerOn": isSpeakerOn]
    )
  }

  @objc private func handleInterruption(_ notification: Notification) {
    guard let userInfo = notification.userInfo,
          let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
          let type = AVAudioSession.InterruptionType(rawValue: typeValue)
    else { return }

    let source = userInfo["RNCallKeep_source"] as? String ?? "system"

    logger
      .log(
        "Interruption \(type == .began ? "⚠️Began" : "✅Ended"), source: \(source), isOtherAudioPlaying: \(audioSession.isOtherAudioPlaying), 🔈Speaker:\(isSpeakerEnabled())"
      )
  }

  @objc private func handleAppDidEnterBackground() {
    logger.log("📱 App didEnterBackground")
    ensureAudioSessionReady()
  }

  @objc private func handleAppDidBecomeActive() {
    logger.log("📱 App didBecomeActive")
    resetAVAudioConfig()
  }
}
