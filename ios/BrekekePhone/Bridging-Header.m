#import "Bridging-Header.h"
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE (BrekekeUtils, NSObject)
RCT_EXTERN_METHOD(webrtcSetAudioEnabled : (BOOL)enabled)
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

RCT_EXTERN_METHOD(playRBT : (BOOL)isLoudSpeaker)
RCT_EXTERN_METHOD(stopRBT
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setProximityMonitoring : (BOOL)enabled)
RCT_EXTERN_METHOD(systemUptimeMs
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject)
@end

@interface RCT_EXTERN_MODULE (BrekekeEmitter, RCTEventEmitter)
@end
