#import "AppDelegate.h"

#import <PushKit/PushKit.h>
#import <RNCPushNotificationIOS.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <React/RCTRootView.h>
#import <UserNotifications/UserNotifications.h>

#import "RNCallKeep.h"
#import "RNSplashScreen.h"
#import "RNVoipPushNotificationManager.h"

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>

static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper =
      [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc]
                            initWithRootNode:application
                        withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc]
                        initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self
                                            launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"BrekekePhone"
                                            initialProperties:nil];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f
                                                    green:1.0f
                                                     blue:1.0f
                                                    alpha:1];
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  UNUserNotificationCenter *center =
      [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;

  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
#if DEBUG
  return
      [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"
                                                     fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main"
                                 withExtension:@"jsbundle"];
#endif
}

// Deep links
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:
                (NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  return [RCTLinkingManager application:application
                                openURL:url
                                options:options];
}
// Universal links
- (BOOL)application:(UIApplication *)application
    continueUserActivity:(NSUserActivity *)userActivity
      restorationHandler:(void (^)(NSArray *_Nullable))restorationHandler {
  [RCTLinkingManager application:application
            continueUserActivity:userActivity
              restorationHandler:restorationHandler];
  // react-native-callkeep
  return [RNCallKeep application:application
            continueUserActivity:userActivity
              restorationHandler:restorationHandler];
}

// react-native-voip-push-notification add PushKit delegate method
- (void)pushRegistry:(PKPushRegistry *)registry
    didUpdatePushCredentials:(PKPushCredentials *)credentials
                     forType:(NSString *)type {
  [RNVoipPushNotificationManager didUpdatePushCredentials:credentials
                                                  forType:(NSString *)type];
}
- (void)pushRegistry:(PKPushRegistry *)registry
    didReceiveIncomingPushWithPayload:(PKPushPayload *)payload
                              forType:(NSString *)type {
  [RNVoipPushNotificationManager
      didReceiveIncomingPushWithPayload:payload
                                forType:(NSString *)type];

  [RNCallKeep reportNewIncomingCall:@"00000000-0000-0000-0000-000000000000"
                             handle:@"Brekeke Phone"
                         handleType:@"generic"
                           hasVideo:false
                localizedCallerName:@"Loading..."
                        fromPushKit:YES
                            payload:NULL
              withCompletionHandler:false];

  // [RNCallKeep endCallWithUUID:@"00000000-0000-0000-0000-000000000000"
  //                      reason:4];
}

- (void)application:(UIApplication *)application
    didRegisterUserNotificationSettings:
        (UIUserNotificationSettings *)notificationSettings {
  [RNCPushNotificationIOS
      didRegisterUserNotificationSettings:notificationSettings];
}
- (void)application:(UIApplication *)application
    didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [RNCPushNotificationIOS
      didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
- (void)application:(UIApplication *)application
    didReceiveRemoteNotification:(NSDictionary *)userInfo
          fetchCompletionHandler:
              (void (^)(UIBackgroundFetchResult))completionHandler {
  [RNCPushNotificationIOS
      didReceiveRemoteNotification:userInfo
            fetchCompletionHandler:^void(UIBackgroundFetchResult result){
                // Empty handler to fix `There is no completion handler with
                // notification id` error
            }];
  completionHandler(UNAuthorizationOptionSound | UNAuthorizationOptionAlert |
                    UNAuthorizationOptionBadge);
}
- (void)application:(UIApplication *)application
    didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [RNCPushNotificationIOS
      didFailToRegisterForRemoteNotificationsWithError:error];
}
- (void)application:(UIApplication *)application
    didReceiveLocalNotification:(UILocalNotification *)notification {
  [RNCPushNotificationIOS didReceiveLocalNotification:notification];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
    didReceiveNotificationResponse:(UNNotificationResponse *)response
             withCompletionHandler:(void (^)(void))completionHandler {
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
  completionHandler();
}
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:
             (void (^)(UNNotificationPresentationOptions options))
                 completionHandler {
  NSDictionary *userInfo = notification.request.content.userInfo;
  [RNCPushNotificationIOS
      didReceiveRemoteNotification:userInfo
            fetchCompletionHandler:^void(UIBackgroundFetchResult result){
                // Empty handler to fix `There is no completion handler with
                // notification id` error
            }];
  completionHandler(UNAuthorizationOptionSound | UNAuthorizationOptionAlert |
                    UNAuthorizationOptionBadge);
}

@end
