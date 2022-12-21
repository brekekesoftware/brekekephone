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


  // TODO LPC
  // lúc user đăng nhập thành công, check nếu đang sử dụng lpc thì gọi
  //
  @objc
  func enableLPC(
    _ deviceId: String,
    appId: String,
    deviceName: String,
    host: String,
    localSsid: String,
    remoteSsids: NSArray,
    tlsKey: String,
    port: NSNumber
  ) {
    NSLog("BrekekeLPCManager:enableLPC");
    var settings = Settings(
      appId: appId,
      uuid: deviceId,
      deviceName: deviceName // username pbx
    )
    // cập nhật localSsid vào arr localSsids
    settings.pushManagerSettings.localSsids = settings.pushManagerSettings.localSsids.filter { $0 != localSsid }
    settings.pushManagerSettings.localSsids.append(localSsid) // cái mới nhất là chèn vào sau cùng
    if (settings.pushManagerSettings.localSsids.count > 10) {
      settings.pushManagerSettings.localSsids.removeFirst() // bỏ cái cũ nhất
    }
    // cập nhật remoteSsid
    settings.pushManagerSettings.remoteSsids = remoteSsids as! [String]
    settings.pushManagerSettings.host = host
    settings.pushManagerSettings.port = UInt16(truncating: port)
    settings.pushManagerSettings.tlsKey = tlsKey
    
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
