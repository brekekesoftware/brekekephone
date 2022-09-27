//
//  AppDelegate.swift
//  BrekekePhone
//
//  Created by ThangNT on 27/09/2022.
//

import Foundation
import UIKit
import UserNotifications
//import PushKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, PKPushRegistryDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?
  var bridge: RCTBridge!
  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    let jsCodeLocation: URL
    jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource:nil)
    let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "BrekekePhone", initialProperties: nil, launchOptions: launchOptions)
    let rootViewController = UIViewController()
    rootViewController.view = rootView
    self.window = UIWindow(frame: UIScreen.main.bounds)
    self.window?.rootViewController = rootViewController
    self.window?.makeKeyAndVisible()
    
    let center:UNUserNotificationCenter! = UNUserNotificationCenter.current()
    center.delegate = self
    
    RNSplashScreen.show()
    
    return true
  }
  
  func sourceURLForBridge(bridge:RCTBridge!) -> NSURL! {
#if DEBUG
    return()
    RCTBundleURLProvider.sharedSettings().jsBundleURLForBundleRoot("index",
                                                                   fallbackResource:nil)
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle") as NSURL?;
#endif
  }
  
  // Deep links
  private func application(application:UIApplication!, openURL url:NSURL!, options:NSDictionary!) -> Bool {
    return RCTLinkingManager.application(application,
                                         open:url as URL,
                                         options:options as! [UIApplication.OpenURLOptionsKey : Any])
  }
  // Universal links
  private func application(application:UIApplication!, continueUserActivity userActivity:NSUserActivity!, restorationHandler: @escaping ([Any]?) -> Void ) -> Bool {
    RCTLinkingManager.application(application,
                                  continue:userActivity,
                                  restorationHandler:restorationHandler)
    // react-native-callkeep
    return RNCallKeep.application(application,
                                  continue:userActivity, restorationHandler: restorationHandler as (([Any]?) -> Void))
  }
  
  // react-native-voip-push-notification add PushKit delegate method
  func pushRegistry(_ registry:PKPushRegistry, didUpdate credentials:PKPushCredentials, for type:(PKPushType)) {
    RNVoipPushNotificationManager.didUpdate(credentials,
                                            forType:(type as NSString) as String)
  }
  func pushRegistry(_ registry:PKPushRegistry, didInvalidatePushTokenFor type:PKPushType) {
    // TODO
  }
  internal func pushRegistry(_ registry:PKPushRegistry, didReceiveIncomingPushWith payload:PKPushPayload, for type:PKPushType, completion:@escaping ()->Void) {
    let uuid:String! = NSUUID().uuidString.uppercased()
    // --- only required if we want to call `completion()` on the js side
    // [RNVoipPushNotificationManager
    //     addCompletionHandler:uuid
    //        completionHandler:completion];
    RNVoipPushNotificationManager.didReceiveIncomingPush(with: payload,
                                                         forType:(type as NSString) as String,
                                                         callkeepUuid:uuid)
    // RNCallKeep
    var callerName:String! = payload.dictionaryPayload["x_displayname"] as? String
    if (callerName == nil) {
      callerName = (payload.dictionaryPayload["x_from"] as? String)
      if (callerName == nil) {
        let aps:NSDictionary! = payload.dictionaryPayload["aps"] as? NSDictionary
        if (aps != nil) {
          callerName = aps.value(forKey: "x_displayname") as? String
          if (callerName == nil) {
            callerName = aps.value(forKey: "x_from") as? String
          }
        }
      }
    }
    if (callerName == nil) {
      callerName = "Loading..."
    }
    RNCallKeep.reportNewIncomingCall(uuid,
                                     handle:"Brekeke Phone",
                                     handleType:"generic",
                                     hasVideo:false,
                                     localizedCallerName:callerName,
                                     supportsHolding:true,
                                     supportsDTMF:true,
                                     supportsGrouping:false,
                                     supportsUngrouping:false,
                                     fromPushKit:true,
                                     payload:payload.dictionaryPayload,
                                     withCompletionHandler:completion)
    // --- don't need to call this if we do on the js side
    // --- already add completion in above reportNewIncomingCall
    // completion();
  }
  
  func application(_ application:UIApplication, didRegister notificationSettings:UIUserNotificationSettings) {
    RNCPushNotificationIOS.didRegister(notificationSettings)
  }
  private func application(application:UIApplication!, didRegisterForRemoteNotificationsWithDeviceToken deviceToken:NSData!) {
    RNCPushNotificationIOS.didRegisterForRemoteNotifications(withDeviceToken: deviceToken as Data?)
  }
  private func application(application:UIApplication!, didFailToRegisterForRemoteNotificationsWithError error:NSError!) {
    RNCPushNotificationIOS.didFailToRegisterForRemoteNotificationsWithError(error)
  }
  private func application(application:UIApplication!, didReceiveRemoteNotification userInfo:NSDictionary!, fetchCompletionHandler completionHandler:(UIBackgroundFetchResult)->Void) {
    RNCPushNotificationIOS.didReceiveRemoteNotification((userInfo as! [AnyHashable : Any]),
                                                        fetchCompletionHandler:{ (result:UIBackgroundFetchResult) in
      // Empty handler to fix `There is no completion handler with
      // notification id` error
    })
    completionHandler(.newData)
  }
  private func application(application:UIApplication!, didReceiveLocalNotification notification:UILocalNotification!) {
    RNCPushNotificationIOS.didReceive(notification)
  }
  
  private func userNotificationCenter(center:UNUserNotificationCenter!, didReceiveNotificationResponse response:UNNotificationResponse!, withCompletionHandler completionHandler:()->Void) {
    RNCPushNotificationIOS.didReceive(response)
    completionHandler()
  }
  internal func userNotificationCenter(_ center:UNUserNotificationCenter, willPresent notification:UNNotification, withCompletionHandler completionHandler:(UNNotificationPresentationOptions)->Void) {
    let userInfo:NSDictionary! = notification.request.content.userInfo as NSDictionary
    RNCPushNotificationIOS.didReceiveRemoteNotification(userInfo as? [AnyHashable : Any],fetchCompletionHandler:{ _ in (UIBackgroundFetchResult).self
      // Empty handler to fix `There is no completion handler with
      // notification id` error
    })
    completionHandler([.sound, .badge])
  }
}
