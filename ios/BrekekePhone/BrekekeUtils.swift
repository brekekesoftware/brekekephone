import AudioToolbox
import AVFoundation
import AVKit
import Combine
import Foundation
import UIKit

@available(iOS 13.0, *)
@objc(BrekekeUtils)
public class BrekekeUtils: NSObject {
  var audio: AVAudioPlayer!
  var audioSession: AVAudioSession!

  override init() {
    audio = nil
    audioSession = AVAudioSession.sharedInstance()
    print("BrekekeUtils.init(): initialized")
  }

  @objc
  func enableLPC(
    _ deviceId: String,
    appId: String,
    deviceName: String,
    ssid: String,
    host: String
  ) {
//    BrekekeLPCManager.shared.loadAllFromPreferences()

    let date = Date()
    let formatter = DateFormatter()
    formatter.dateFormat = "HH:mm:ss.SSSS"
//    var settingInfo = SettingsManager.shared.settings
//    settingInfo.uuid = deviceId
//    settingInfo.appId = appId
//    settingInfo.deviceName = deviceName
//    settingInfo.pushManagerSettings.ssid = ssid
//    settingInfo.pushManagerSettings.host = host
//    settingInfo.pushManagerSettings.payLoad = formatter.string(from: date)
    var settings = Settings(
      appId: appId,
      uuid: deviceId,
      deviceName: deviceName + formatter.string(from: date) // username pbx
    )
    settings.pushManagerSettings.ssid = ssid
    settings.pushManagerSettings.host = host
//    settings.pushManagerSettings.payLoad = formatter.string(from: date)

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
    print("BrekekeUtils.stopRBT()")
    if audio != nil {
      audio.stop()
      audio = nil
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
}
