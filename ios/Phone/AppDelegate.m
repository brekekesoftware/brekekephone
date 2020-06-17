/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

#import <PushKit/PushKit.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <React/RCTLog.h>
#import <React/RCTRootView.h>

#import "RNCallKeep.h"
#import "RNSplashScreen.h"
#import "RNVoipPushNotificationManager.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  //
  NSURL *jsCodeLocation;
#ifdef DEBUG
  jsCodeLocation =
      [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"
                                                     fallbackResource:nil];
#else
  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main"
                                           withExtension:@"jsbundle"];
#endif
  //
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"App"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f
                                                    green:1.0f
                                                     blue:1.0f
                                                    alpha:1];
  //
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  //
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  //
  [RNSplashScreen show];
  RCTSetLogThreshold(RCTLogLevelInfo);
  //
  return YES;
}

//
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

//
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
  
  [RNCallKeep endCallWithUUID:@"00000000-0000-0000-0000-000000000000"
                       reason:4];
}

@end
