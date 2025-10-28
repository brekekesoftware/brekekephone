import AudioToolbox
import AVFoundation
import AVKit
import Combine
import Foundation
import UIKit
import WebRTC

@available(iOS 13.0, *)
@objc(BrekekeUtils)
public class BrekekeUtils: NSObject {
  var audio: AVAudioPlayer!
  var audioSession: AVAudioSession!
  var am: AudioSessionManager

  var output: [String: AVAudioSession.Port] = [:]
  private let logger = Logger(
    prependString: "BrekekeUtils",
    subsystem: .general
  )

  override init() {
    am = AudioSessionManager.shared
    super.init()
    audio = nil
    audioSession = AVAudioSession.sharedInstance()
    logger.log("initialized")
  }

  // Native module methods

  @objc
  func resetAudioConfig() {
    am.resetAVAudioConfig()
  }

  @objc
  func isSpeakerOn(_ resolve: @escaping RCTPromiseResolveBlock,
                   rejecter _: @escaping RCTPromiseRejectBlock) {
    resolve(am.isSpeakerEnabled())
  }

  @objc
  func webrtcSetAudioEnabled(_ enabled: Bool, action: String) {
    am.setAudioActive(enabled, action: action)
  }

  @objc
  func setProximityMonitoring(_ enabled: Bool) {
    DispatchQueue.main.async {
      if UIDevice.current.isProximityMonitoringEnabled != enabled {
        UIDevice.current.isProximityMonitoringEnabled = enabled
      }
    }
  }

  @objc
  func enableLPC(
    _ token: String,
    tokenVoip: String,
    username: String,
    host: String,
    port: NSNumber,
    remoteSsids: NSArray,
    localSsid: String,
    tlsKeyHash: String
  ) {
    logger.log("BrekekeLPCManager:enableLPC")
    var settings = Settings(
      token: token,
      tokenVoip: tokenVoip,
      username: username
    )
    settings.pushManagerSettings.remoteSsids = remoteSsids as! [String]
    if !localSsid.isEmpty {
      settings.pushManagerSettings.localSsids = settings.pushManagerSettings
        .localSsids.filter { $0 != localSsid }
      settings.pushManagerSettings.localSsids
        .append(localSsid)
      if settings.pushManagerSettings.localSsids.count > 10 {
        settings.pushManagerSettings.localSsids.removeFirst()
      }
    }
    settings.pushManagerSettings.host = host
    settings.pushManagerSettings.port = UInt16(truncating: port)
    settings.pushManagerSettings.tlsKeyHash = tlsKeyHash
    logger.log("BrekekeLPCManager:enableLPC: \(settings)")
    do {
      try SettingsManager.shared.set(settings: settings)
    } catch let error as NSError {
      logger.log("Error encoding settings - \(error)")
    }
  }

  @objc
  func disableLPC() {
    do {
      BrekekeLPCManager.shared.pushManager?.remove()
      var old = SettingsManager.shared.settings
      old.pushManagerSettings.enabled = false
      try SettingsManager.shared.set(settings: old)
    } catch {}
  }

  @objc
  func playRBT(_ isLoudSpeaker: Bool) {
    do {
      let v: Float = isLoudSpeaker ? 1.0 : 0.3
      if audio != nil {
        if audio.isPlaying {
          audio?.volume = v
        }
        return
      }

      // load ringback tone mp3 file
      guard let soundURL = Bundle.main.url(
        forResource: "incallmanager_ringback",
        withExtension: "mp3"
      ) else {
        logger.log("playRBT: Failed to find incallmanager_ringback.mp3")
        return
      }

      // set volume: 1.0 for Speaker (loudspeaker mode), 0.3 for Receiver
      // (earpiece).
      // normalized ringback tone (-0.9 dB) with volume=1.0 was too loud for
      // Receiver due to high systemVolume (0.75).
      // 0.3 ensures comfortable Receiver output while keeping Speaker loud.
      audio = try AVAudioPlayer(contentsOf: soundURL)
      audio?.numberOfLoops = -1
      audio?.volume = v
      audio?.prepareToPlay()
      am.setupAVAdioSession(.default)
      try audioSession.overrideOutputAudioPort(isLoudSpeaker ? .speaker : .none)
      audio?.play()
      logger.log("playRBT: Playing, loudspeaker=\(isLoudSpeaker)")
    } catch {
      logger.log("playRBT: Error: \(error.localizedDescription)")
    }
  }

  @objc
  func stopRBT(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    if audio != nil {
      logger.log("stopRBT: Stopped")
      audio?.stop()
      audio = nil
    }
    do {
      // Deactivate AVAudioSession with notifyOthersOnDeactivation.
      // Reason: Ensures WebRTC or RNInCallManager can configure audio routes without conflicts after stopping RBT.
      // Notifying others allows WebRTC to activate AVAudioSession cleanly
      let isSpeakerOn = am.isSpeakerEnabled()
      am.setupAVAdioSession(.voiceChat)
      logger.log("stopRBT: AVAudioSession deactivated")
      am.setAudioActive(true)
      if isSpeakerOn {
        try audioSession.overrideOutputAudioPort(.speaker)
      } else {
        try audioSession.overrideOutputAudioPort(.none)
      }
      resolve(nil)
    } catch {
      logger.log(
        "stopRBT: Error deactivating AVAudioSession: \(error.localizedDescription)"
      )
      reject("stopRBT: Error", error.localizedDescription, error)
    }
  }

  @objc
  func systemUptimeMs(
    _ resolve: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    do {
      var boottime = timeval()
      var mib: [Int32] = [CTL_KERN, KERN_BOOTTIME]
      var size = MemoryLayout<timeval>.stride
      var now = time_t()
      var uptime: time_t = -1
      time(&now)
      if sysctl(&mib, 2, &boottime, &size, nil, 0) != -1, boottime.tv_sec != 0 {
        uptime = (now - boottime.tv_sec) * 1000
        resolve(uptime)
      } else {
        resolve(-1)
      }
    } catch {
      resolve(-1)
    }
  }

  // ringtone
  @objc
  func getRingtoneOptions(_ resolve: RCTPromiseResolveBlock,
                          rejecter _: RCTPromiseRejectBlock) {
    var results : [String] = []
    for ringtone in RingtoneUtils.staticRingtones {
      results.append(ringtone)
    }

    let r = RingtoneUtils.getRingtonePicker()
    resolve(results + r)
  }

  @objc
  func validateRingtone(_ ringtone : String,
                        username : String,
                        tenant : String,
                        host: String,
                        port : String,
                        resolver resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) {
      resolve(RingtoneUtils.getRingtone(ringtone: ringtone, username: username, tenant: tenant, host: host, port: port))
  }
}
