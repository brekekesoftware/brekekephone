#import "Bridging-Header.h"
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (BrekekeUtils, NSObject)
RCT_EXTERN_METHOD(webrtcSetAudioEnabled : (nonnull Boolean *)enabled)
RCT_EXTERN_METHOD(enableLPC
                  : (NSString *)token tokenVoip
                  : (NSString *)tokenVoip username
                  : (NSString *)username host
                  : (NSString *)host port
                  : (nonnull NSNumber *)port remoteSsids
                  : (NSArray *)remoteSsids localSsid
                  : (NSString *)localSsid tlsKeyHash
                  : (NSString *)tlsKeyHash)
RCT_EXTERN_METHOD(disableLPC)
RCT_EXTERN_METHOD(playRBT)
RCT_EXTERN_METHOD(stopRBT)
RCT_EXTERN_METHOD(systemUptimeMs
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject)
@end
