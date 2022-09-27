//
//  BrekekeUtils.swift
//  BrekekePhone
//
//  Created by ThangNT on 27/09/2022.
//

//#import "BrekekeUtils.h"
import Foundation
import UIKit
import Combine
import SwiftUI
import AVFoundation
import AudioToolbox
import UIKit
import AVKit
@available(iOS 13.0, *)
@objc(BrekekeUtils)
public class BrekekeUtils: NSObject {
  
  var audio:AVAudioPlayer!
  var audioSession:AVAudioSession!
  
  override init() {
    audio = nil
    audioSession = AVAudioSession.sharedInstance()
    NSLog("BrekekeUtils.init(): initialized")
  }
  
  @objc
  func playRBT(){
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
      
      let soundFilePath:String! = String(format:"%@/incallmanager_ringback.mp3",
                                         Bundle.main.resourcePath!)
      let soundFileURL  = URL(fileURLWithPath: soundFilePath)
      audio = try AVAudioPlayer(contentsOf: soundFileURL)
      audio.numberOfLoops = -1
      audio.prepareToPlay()
      try audioSession.setCategory(AVAudioSession.Category.playAndRecord)
      audio.play()
    } catch let error as NSError {
      //self.player = nil
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
  func systemUptimeMs(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    do {
      var boottime = timeval()
      var mib: [Int32] = [CTL_KERN, KERN_BOOTTIME]
      var size = MemoryLayout<timeval>.stride
      
      var now = time_t()
      var uptime: time_t = -1
      
      time(&now)
      if (sysctl(&mib, 2, &boottime, &size, nil, 0) != -1 && boottime.tv_sec != 0) {
        uptime = (now - boottime.tv_sec) * 1000
        resolve(uptime)
      }else {
        resolve(-1)
      }
      
    } catch  {
      resolve(-1);
    }
  }
  
  
}
