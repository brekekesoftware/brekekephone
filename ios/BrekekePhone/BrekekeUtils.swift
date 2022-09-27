import AudioToolbox
import AVFoundation
import AVKit
import Combine
import Foundation
import SwiftUI
import UIKit

@available(iOS 13.0, *)
@objc(BrekekeUtils)
public class BrekekeUtils: NSObject {
  var audio: AVAudioPlayer!
  var audioSession: AVAudioSession!

  override init() {
    audio = nil
    audioSession = AVAudioSession.sharedInstance()
    NSLog("BrekekeUtils.init(): initialized")
  }

  @objc
  func playRBT() {
    NSLog("BrekekeUtils.playRBT()")
    do {
      if audio != nil {
        if audio.isPlaying {
          NSLog("startRingback(): is already playing")
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
      NSLog(error.localizedDescription)
    } catch {
      NSLog("AVAudioPlayer init failed")
    }
  }

  @objc
  func stopRBT() {
    NSLog("BrekekeUtils.stopRBT()")
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
