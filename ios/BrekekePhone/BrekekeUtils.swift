import AudioToolbox
import AVFoundation
import AVKit
import Combine
import Foundation
import SwiftUI
import UIKit
import BrekekeLPC
@available(iOS 13.0, *)
@objc(BrekekeUtils)
public class BrekekeUtils: NSObject {
  var audio: AVAudioPlayer!
  var audioSession: AVAudioSession!
  @State private var viewModel = DirectoryViewModel()
//  @State private var messageModel = MessagingViewModel(receiver: <#User#>, message: <#TextMessage?#>)
  @State private var settingViewModel = SettingsViewModel()

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
  func  getListUser(){
   
    
  }
  @objc
  func sendMessageLPC(_ message: String) {
    print("sendMessagePN \(viewModel.users)")
    
//    let uuID = UUID(uuidString: "6F90DA39-1C24-4824-A653-EF4831E05EAD")
//    if uuID != nil {
//        print("UUID string with hypens is valid") // Will be valid
//        let receiver = User(uuid: uuID!, deviceName: "iPhone (3)")
//      let sender = UserManager.shared.currentUser
//      let routing = Routing(sender: sender, receiver: sender)
//      let textMessage = TextMessage(routing: routing, message: "isMe:\(message)")
////      ControlChannel.shared.connect()
//      print("Sending text message to \(sender.deviceName) through Control Channel")
////      ControlChannel.shared.request(message: textMessage)
//      MessagingManager.shared.send(message: "Anh day", to: sender)
//    } else {
//        print("UUID string with hypens is not valid")
//    }
    
    let sender = UserManager.shared.currentUser
    
    if(viewModel.users.count <= 1){
      return ()
    }
    let receiver = viewModel.users[1]
    let routing = Routing(sender: sender, receiver: viewModel.users[1])
    let textMessage = TextMessage(routing: routing, message: "isMe:\(message)")
//      ControlChannel.shared.connect()
    print("Sending text message to \(receiver.deviceName) through Control Channel")
    MessagingManager.shared.send(message: "bbb day", to: receiver)
  }
  
  @objc
  func makeCallLPC() {
    NSLog("makeCall")
//    let uuID = UUID(uuidString: "A5D2F7DA-2662-484C-9CCB-F69ACEFF5CB4")
//    if uuID != nil {
//        print("UUID string with hypens is valid") // Will be valid
//        let receiver = User(uuid: uuID!, deviceName: "Ngọc Trâm")
//      let sender = UserManager.shared.currentUser
//      print("Make call to \(receiver.deviceName) through Control Channel")
//      CallManager.shared.sendCall(to: receiver)
//    } else {
//        print("UUID string with hypens is not valid")
//    }
    if(viewModel.users.count <= 1){
      return ()
    }
    let receiver = viewModel.users[1]
    CallManager.shared.sendCall(to: receiver)
  }
  
  @objc
  func endCallLPC(){
    print("End call through Control Channel")
    CallManager.shared.endCall()
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
