#import "Bridging-Header.h"
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (BrekekeUtils, NSObject)
RCT_EXTERN_METHOD(systemUptimeMs
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(playRBT)
RCT_EXTERN_METHOD(stopRBT)
RCT_EXTERN_METHOD(enableLPC
                  : (NSString *)deviceId appId
                  : (NSString *)appId deviceName
                  : (NSString *)deviceName ssid
                  : (NSString *)ssid host
                  : (NSString *)host)
RCT_EXTERN_METHOD(disableLPC)
@end
