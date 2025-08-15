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
  var rtcAudioSession: RTCAudioSession!
  var debounceWorkItem: DispatchWorkItem?

  override init() {
    super.init()
    audio = nil
    audioSession = AVAudioSession.sharedInstance()
    rtcAudioSession = RTCAudioSession.sharedInstance()
    rtcAudioSession.useManualAudio = true
    listenAudioSessionRoute()
    print("BrekekeUtils.init(): initialized")
  }

  @objc
  func webrtcSetAudioEnabled(_ enabled: Bool) {
    if enabled {
      rtcAudioSession.audioSessionDidActivate(audioSession)
    } else {
      rtcAudioSession.audioSessionDidDeactivate(audioSession)
    }
    rtcAudioSession.isAudioEnabled = enabled
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
    print("BrekekeLPCManager:enableLPC")
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
    print("BrekekeLPCManager:enableLPC: \(settings)")
    do {
      try SettingsManager.shared.set(settings: settings)
    } catch let error as NSError {
      print("Error encoding settings - \(error)")
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
      if audio != nil {
        if audio.isPlaying {
          return ()
        } else {
          audio.stop()
          audio = nil
        }
      }

      // load ringback tone mp3 file
      guard let soundURL = Bundle.main.url(
        forResource: "incallmanager_ringback",
        withExtension: "mp3"
      ) else {
        print("BrekekeUtils.playRBT: Failed to find incallmanager_ringback.mp3")
        return
      }

      // set volume: 1.0 for Speaker (loudspeaker mode), 0.3 for Receiver
      // (earpiece).
      // normalized ringback tone (-0.9 dB) with volume=1.0 was too loud for
      // Receiver due to high systemVolume (0.75).
      // 0.3 ensures comfortable Receiver output while keeping Speaker loud.
      audio = try AVAudioPlayer(contentsOf: soundURL)
      audio?.numberOfLoops = -1
      audio?.volume = isLoudSpeaker ? 1.0 : 0.3
      audio?.prepareToPlay()

      try audioSession.setCategory(
        .playAndRecord,
        mode: .voiceChat,
        options: [.allowBluetooth, .defaultToSpeaker, .mixWithOthers]
      )
      try audioSession.setActive(true)
      try audioSession.overrideOutputAudioPort(isLoudSpeaker ? .speaker : .none)

      audio?.play()
      print("BrekekeUtils.playRBT: Playing, loudspeaker=\(isLoudSpeaker)")
    } catch {
      print("BrekekeUtils.playRBT: Error: \(error.localizedDescription)")
    }
  }

  @objc
  func stopRBT(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    if audio != nil {
      print("BrekekeUtils.stopRBT: Stopped")
      audio?.stop()
      audio = nil
    }
    do {
      // Deactivate AVAudioSession with notifyOthersOnDeactivation.
      // Reason: Ensures WebRTC or RNInCallManager can configure audio routes without conflicts after stopping RBT.
      // Notifying others allows WebRTC to activate AVAudioSession cleanly
      try audioSession.setActive(false, options: .notifyOthersOnDeactivation)
      print("BrekekeUtils.stopRBT: AVAudioSession deactivated")
      resolve(nil)
    } catch {
      print(
        "BrekekeUtils.stopRBT: Error deactivating AVAudioSession: \(error.localizedDescription)"
      )
      reject("BrekekeUtils.stopRBT: Error", error.localizedDescription, error)
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

  // listener audio session event
  private func listenAudioSessionRoute() {
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleAudioRouteChange(_:)),
      name: AVAudioSession.routeChangeNotification,
      object: nil
    )
  }

  @objc private func handleAudioRouteChange(_: Notification) {
    let session = AVAudioSession.sharedInstance()
    debounceWorkItem?.cancel()
    debounceWorkItem = DispatchWorkItem { [weak self] in
      do {
        if let o = session.currentRoute.outputs.first {
          if o.portType == .builtInSpeaker {
            try session.overrideOutputAudioPort(.speaker)
          } else if o.portType == .builtInReceiver {
            try session.overrideOutputAudioPort(.none)
          }

          BrekekeEmitter.emit(
            name: "onAudioRouteChange",
            data: ["isSpeakerOn": o.portType == .builtInSpeaker]
          )
        }

        if session.mode == .voiceChat {
          try session.setMode(.default)
          try session.setActive(true)
        }
      } catch {}
    }
    DispatchQueue.main.asyncAfter(
      deadline: .now() + 0.4,
      execute: debounceWorkItem!
    )
  }
}
