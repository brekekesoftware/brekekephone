import Combine
import Foundation
import SwiftUI
import UIKit

@UIApplicationMain
class AppDelegate: NSObject, UIApplicationDelegate, PKPushRegistryDelegate,
  UNUserNotificationCenterDelegate, ObservableObject {
  override init() {
    super.init()
    BrekekeLPCManager.shared.initialize()
  }

  var window: UIWindow?
  var bridge: RCTBridge!

  func application(
    _: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication
      .LaunchOptionsKey: Any]?
  ) -> Bool {
    let jsCodeLocation: URL
    jsCodeLocation = RCTBundleURLProvider.sharedSettings()
      .jsBundleURL(forBundleRoot: "index")!
    let rootView = RCTRootView(
      bundleURL: jsCodeLocation,
      moduleName: "BrekekePhone",
      initialProperties: nil,
      launchOptions: launchOptions
    )
    let rootViewController = UIViewController()
    rootViewController.view = rootView
    window = UIWindow(frame: UIScreen.main.bounds)
    window?.rootViewController = rootViewController
    window?.makeKeyAndVisible()
    UNUserNotificationCenter.current().delegate = self
    RNSplashScreen.show()
    return true
  }

  func sourceURLForBridge(bridge _: RCTBridge!) -> NSURL! {
    #if DEBUG
      return (
        RCTBundleURLProvider
          .sharedSettings()
          .jsBundleURL(
            forBundleRoot: "index",
            fallbackExtension: nil
          )
      ) as NSURL?
    #else
      return Bundle
        .main
        .url(forResource: "main", withExtension: "jsbundle") as NSURL?
    #endif
  }

  // deep links
  func application(
    _ application: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return RCTLinkingManager
      .application(application,
                   open: url as URL,
                   options: options)
  }

  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    // universal links
    RCTLinkingManager.application(application,
                                  continue: userActivity,
                                  restorationHandler: restorationHandler)
    // react-native-callkeep
    RNCallKeep.application(application,
                           continue: userActivity,
                           restorationHandler: restorationHandler)
    return true
  }

  // react-native-voip-push-notification add PushKit delegate method
  func pushRegistry(
    _: PKPushRegistry,
    didUpdate credentials: PKPushCredentials,
    for type: PKPushType
  ) {
    RNVoipPushNotificationManager.didUpdate(credentials,
                                            forType:
                                            (type as NSString) as String)
  }

  func pushRegistry(_: PKPushRegistry,
                    didInvalidatePushTokenFor _: PKPushType) {
    // TODO:
  }

  func pushRegistry(
    _: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {
    let uuid: String! = NSUUID().uuidString.uppercased()
    // --- only required if we want to call `completion()` on the js side
    // [RNVoipPushNotificationManager
    //     addCompletionHandler:uuid
    //        completionHandler:completion];
    RNVoipPushNotificationManager
      .didReceiveIncomingPush(with: payload,
                              forType: (type as NSString) as String,
                              callkeepUuid: uuid)
    
    // config RNCallKeep
    AppDelegate.reportNewIncomingCall(
      uuid: uuid,
      payload: payload.dictionaryPayload,
      handler: completion
    )
    // --- don't need to call this if we do on the js side
    // --- already add completion in above reportNewIncomingCall
    // completion();
  }

  // https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622930-application?language=objc
  func application(
    _: UIApplication,
    didRegister notificationSettings: UIUserNotificationSettings
  ) {
    RNCPushNotificationIOS.didRegister(notificationSettings)
  }

  func application(_: UIApplication,
                   didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    RNCPushNotificationIOS
      .didRegisterForRemoteNotifications(withDeviceToken: deviceToken as Data?)
  }

  func application(_: UIApplication,
                   didFailToRegisterForRemoteNotificationsWithError error: Error) {
    RNCPushNotificationIOS
      .didFailToRegisterForRemoteNotificationsWithError(error)
  }

  func application(
    _: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler _: @escaping (
      UIBackgroundFetchResult
    )
      -> Void
  ) {
    RNCPushNotificationIOS.didReceiveRemoteNotification(
      userInfo as? [AnyHashable: Any],
      fetchCompletionHandler: { (_: UIBackgroundFetchResult) in
        // empty handler to fix error:
        // "There is no completion handler with notification id"
      }
    )
  }

  // process the user's response to a delivered notification
  func userNotificationCenter(
    _: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: () -> Void
  ) {
    RNCPushNotificationIOS.didReceive(response)
    completionHandler()
  }

  // manage notifications while app is in the foreground
  func userNotificationCenter(
    _: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: (UNNotificationPresentationOptions)
      -> Void
  ) {
    let userInfo: NSDictionary! = notification.request.content
      .userInfo as NSDictionary
    RNCPushNotificationIOS.didReceiveRemoteNotification(
      userInfo as? [AnyHashable: Any],
      fetchCompletionHandler: { _ in UIBackgroundFetchResult.self
        // empty handler to fix error:
        // "There is no completion handler with notification id"
      }
    )
    // 'alert' was deprecated in iOS 14.0 instead by banner
    completionHandler([.sound, .badge, .banner])
  }

  public static func reportNewIncomingCall(
    uuid: String,
    payload: [AnyHashable: Any],
    handler: (() -> Void)?
  ) {
    if(AccountUtils.find(m: payload) == nil) {
      print("Account 404")
      return;
    }
    let from: String! = PN.callerName(payload)
    // ringtone
    let ringtoneName = PN.ringtone(payload) ?? ""
    let username = PN.username(payload) ?? ""
    let tenant = PN.tenant(payload) ?? ""
    let host = PN.host(payload) ?? ""
    let port = PN.port(payload) ?? ""
    let name: String! = from
    RNCallKeep.reportNewIncomingCall(uuid,
                                     handle: from,
                                     handleType: "generic",
                                     hasVideo: false,
                                     localizedCallerName: name,
                                     supportsHolding: true,
                                     supportsDTMF: true,
                                     supportsGrouping: false,
                                     supportsUngrouping: false,
                                     fromPushKit: true,
                                     payload: payload,
                                     withCompletionHandler: handler,
                                     ringtone:RingtoneUtils.getRingtone(ringtone: ringtoneName, username: username, tenant: tenant, host: host, port: port))
  }
}
