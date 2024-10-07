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

  override init() {
    audio = nil
    audioSession = AVAudioSession.sharedInstance()
    rtcAudioSession = RTCAudioSession.sharedInstance()
    rtcAudioSession.useManualAudio = true
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
  func playRBT() {
    print("BrekekeUtils.playRBT()")
    do {
      if audio != nil {
        if audio.isPlaying {
          print("startRingback(): is already playing")
          return ()
        } else {
          stopRBT()
        }
      }
      let soundFilePath: String! = String(
        format: "%@/incallmanager_ringback.mp3",
        Bundle.main.resourcePath!
      )
      let soundFileURL = URL(fileURLWithPath: soundFilePath)
      audio = try AVAudioPlayer(contentsOf: soundFileURL)
      audio.numberOfLoops = -1
      audio.prepareToPlay()
      try audioSession.setCategory(AVAudioSession.Category.playAndRecord)
      audio.play()
    } catch let error as NSError {
      print(error.localizedDescription)
    } catch {
      print("AVAudioPlayer init failed")
    }
  }

  @objc
  func stopRBT() {
    if audio == nil {
      return
    }
    print("BrekekeUtils.stopRBT()")
    audio.stop()
    audio = nil
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
}
