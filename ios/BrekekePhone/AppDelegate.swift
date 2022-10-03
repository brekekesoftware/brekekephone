import Foundation
import SwiftUI
import UIKit
import Combine
import UserNotifications
import BrekekeLPC
@UIApplicationMain
class AppDelegate: NSObject, UIApplicationDelegate, PKPushRegistryDelegate,
                   UNUserNotificationCenterDelegate, ObservableObject {

  private(set) lazy var isExecutingInBackgroundPublisher: AnyPublisher<Bool, Never> = {
      Just(true)
      .merge(with:
          NotificationCenter.default.publisher(for: UIApplication.didEnterBackgroundNotification)
          .merge(with: NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification))
          .map { notification -> Bool in
              notification.name == UIApplication.didEnterBackgroundNotification
          }
      )
      .debounce(for: .milliseconds(100), scheduler: dispatchQueue)
      .eraseToAnyPublisher()
  }()
  private let dispatchQueue = DispatchQueue(label: "AppDelegate.dispatchQueue")
  private var cancellables = Set<AnyCancellable>()
  private let logger = Logger(prependString: "AppDelegate", subsystem: .general)
  @StateObject private var rootViewCoordinator = RootViewCoordinator()
  @State private var userViewModels = [UUID: UserViewModel]()

  var window: UIWindow?
  var bridge: RCTBridge!

//  func application(
//      _ application: UIApplication,
//      configurationForConnecting connectingSceneSession: UISceneSession,
//      options: UIScene.ConnectionOptions
//    ) -> UISceneConfiguration {
//      let sceneConfig = UISceneConfiguration(name: nil, sessionRole: connectingSceneSession.role)
//      sceneConfig.delegateClass = AppDelegate.self // 👈🏻
//      return sceneConfig
//    }

  func application(
    _: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication
      .LaunchOptionsKey: Any]?
  ) -> Bool {

    initLCP()

    let jsCodeLocation: URL
    jsCodeLocation = RCTBundleURLProvider.sharedSettings()
      .jsBundleURL(forBundleRoot: "index", fallbackResource: nil)
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
    let center: UNUserNotificationCenter! = UNUserNotificationCenter.current()
    center.delegate = self
    RNSplashScreen.show()
    return true
  }


  func initLCP(){
    print("initLCP")
    // It is important to initialize the PushConfigurationManager as early as possible during app initialization.
    PushConfigurationManager.shared.initialize()

    // Initialize the central messaging manager for text communication and request notification permission from the user.
    MessagingManager.shared.initialize()
    MessagingManager.shared.requestNotificationPermission()
    do {
        print("Saving updated settings")
        try SettingsManager.shared.set(settings: SettingsManager.shared.settings)
        // ControlChannel.shared.connect()
    } catch {
      print("Saving to settings failed with error: \(error)")
    }
//    ControlChannel.shared.setHost("192.168.89.2")
//    ControlChannel.shared.connect()
    // Register this device with the control channel.
    // let user = User(uuid: UserManager.shared.currentUser.uuid, deviceName: UserManager.shared.currentUser.deviceName)
    // ControlChannel.shared.register(user)



    // Observe the active state of NEAppPushManager to display the active state in the SettingsView.
    PushConfigurationManager.shared.pushManagerIsActivePublisher
        .receive(on: DispatchQueue.main)
        .sink { [weak self] isAppPushManagerActive in
            print("isActive:\(isAppPushManagerActive)")
        }
        .store(in: &cancellables)

    // Connect the control channel when the app is in the foreground or responding to a CallKit call in the background. Disconnect the control
    // channel when the app is in the background and not in a CallKit call.
    isExecutingInBackgroundPublisher
        .combineLatest(CallManager.shared.$state)
        .sink { [weak self] isExecutingInBackground, callManagerState in
          guard self != nil else {
                return
            }

            if isExecutingInBackground {
                switch callManagerState {
                // case .connecting:
//                    self.logger.log("App running in background and the CallManager's state is connecting, connecting to control channel")
                    // ControlChannel.shared.connect()
                // case .disconnected:
//                    self.logger.log("App running in background and the CallManager's state is disconnected, disconnecting from control channel")
                    // ControlChannel.shared.disconnect()
                default:
                    print("App running in background")
                }
            } else {
//                self.logger.log("App running in foreground, connecting to control channel")
                // ControlChannel.shared.connect()
            }
        }
        .store(in: &cancellables)
  }

//  func viewModel(for user: User) -> UserViewModel {
//      userViewModels.get(user.id, insert: UserViewModel(user: user))
//  }

  func applicationWillTerminate(_ application: UIApplication) {
//      logger.log("Application is terminating, disconnecting control channel")
      // ControlChannel.shared.disconnect()
  }


  func sourceURLForBridge(bridge _: RCTBridge!) -> NSURL! {
    #if DEBUG
      return ()
      RCTBundleURLProvider
        .sharedSettings()
        .jsBundleURLForBundleRoot("index", fallbackResource: nil)
    #else
      return Bundle
        .main
        .url(forResource: "main", withExtension: "jsbundle") as NSURL?
    #endif
  }

  // Deep links
  private func application(
    application: UIApplication!,
    openURL url: NSURL!,
    options: NSDictionary!
  ) -> Bool {
    return RCTLinkingManager
      .application(application,
                   open: url as URL,
                   options: options as! [UIApplication.OpenURLOptionsKey: Any])
  }

  // Universal links
  private func application(
    application: UIApplication!,
    continueUserActivity userActivity: NSUserActivity!,
    restorationHandler: @escaping ([Any]?) -> Void
  ) -> Bool {
    RCTLinkingManager.application(application,
                                  continue: userActivity,
                                  restorationHandler: restorationHandler)
    // react-native-callkeep
    return RNCallKeep.application(application,
                                  continue: userActivity,
                                  restorationHandler: restorationHandler as
                                    (([Any]?) -> Void))
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

  internal func pushRegistry(
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
    // RNCallKeep
    var callerName: String! = payload
      .dictionaryPayload["x_displayname"] as? String
    if callerName == nil {
      callerName = (payload.dictionaryPayload["x_from"] as? String)
      if callerName == nil {
        let aps: NSDictionary! = payload
          .dictionaryPayload["aps"] as? NSDictionary
        if aps != nil {
          callerName = aps.value(forKey: "x_displayname") as? String
          if callerName == nil {
            callerName = aps.value(forKey: "x_from") as? String
          }
        }
      }
    }
    if callerName == nil {
      callerName = "Loading..."
    }
    RNCallKeep.reportNewIncomingCall(uuid,
                                     handle: "Brekeke Phone",
                                     handleType: "generic",
                                     hasVideo: false,
                                     localizedCallerName: callerName,
                                     supportsHolding: true,
                                     supportsDTMF: true,
                                     supportsGrouping: false,
                                     supportsUngrouping: false,
                                     fromPushKit: true,
                                     payload: payload.dictionaryPayload,
                                     withCompletionHandler: completion)
    // --- don't need to call this if we do on the js side
    // --- already add completion in above reportNewIncomingCall
    // completion();
  }

  func application(
    _: UIApplication,
    didRegister notificationSettings: UIUserNotificationSettings
  ) {
    RNCPushNotificationIOS.didRegister(notificationSettings)
  }

  private func application(
    application _: UIApplication!,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: NSData!
  ) {
    RNCPushNotificationIOS
      .didRegisterForRemoteNotifications(withDeviceToken: deviceToken as Data?)
  }

  private func application(
    application _: UIApplication!,
    didFailToRegisterForRemoteNotificationsWithError error: NSError!
  ) {
    RNCPushNotificationIOS
      .didFailToRegisterForRemoteNotificationsWithError(error)
  }

  private func application(
    application _: UIApplication!,
    didReceiveRemoteNotification userInfo: NSDictionary!,
    fetchCompletionHandler completionHandler: (UIBackgroundFetchResult) -> Void
  ) {
    RNCPushNotificationIOS.didReceiveRemoteNotification(
      userInfo as! [AnyHashable: Any],
      fetchCompletionHandler: { (_: UIBackgroundFetchResult) in
        // Empty handler to fix error:
        // "There is no completion handler with notification id"
      }
    )
    completionHandler(.newData)
  }

  private func application(
    application _: UIApplication!,
    didReceiveLocalNotification notification: UILocalNotification!
  ) {
    RNCPushNotificationIOS.didReceive(notification)
  }

  private func userNotificationCenter(
    center _: UNUserNotificationCenter!,
    didReceiveNotificationResponse response: UNNotificationResponse!,
    withCompletionHandler completionHandler: () -> Void
  ) {
    RNCPushNotificationIOS.didReceive(response)
    completionHandler()
  }

  internal func userNotificationCenter(
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
        // Empty handler to fix error:
        // "There is no completion handler with notification id"
      }
    )
    completionHandler([.sound, .badge])
  }
}
