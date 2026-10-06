#import "Bridging-Header.h"
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <BrekekePhoneSpec/BrekekePhoneSpec.h>
#import <NetworkExtension/NetworkExtension.h>
#import "Brekeke_Phone-Swift.h"

// RCT_EXTERN_MODULE would redeclare BrekekeEmitter, already declared by the Swift header
@interface BrekekeEmitter (RCTExternModule) <RCTBridgeModule>
@end
@implementation BrekekeEmitter (RCTExternModule)
RCT_EXPORT_MODULE_NO_LOAD(, BrekekeEmitter)
@end

@interface BrekekeUtilsTurbo : NSObject <NativeBrekekeUtilsSpec>
@end

@implementation BrekekeUtilsTurbo {
  BrekekeUtils *_utils;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _utils = [BrekekeUtils new];
  }
  return self;
}

+ (NSString *)moduleName {
  return @"BrekekeUtils";
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeBrekekeUtilsSpecJSI>(params);
}

- (void)resetAudioConfig {
  [_utils resetAudioConfig];
}

- (void)isSpeakerOn:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [_utils isSpeakerOn:resolve rejecter:reject];
}

- (void)clearAppCache:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [_utils clearAppCache:resolve rejecter:reject];
}

- (void)webrtcSetAudioEnabled:(BOOL)enabled action:(NSString *)action {
  [_utils webrtcSetAudioEnabled:enabled action:action ?: @""];
}

- (void)setProximityMonitoring:(BOOL)enabled {
  [_utils setProximityMonitoring:enabled];
}

- (void)enableLPC:(NSString *)token tokenVoip:(NSString *)tokenVoip username:(NSString *)username host:(NSString *)host port:(NSInteger)port remoteSsids:(NSArray *)remoteSsids localSsid:(NSString *)localSsid tlsKeyHash:(NSString *)tlsKeyHash {
  [_utils enableLPC:token tokenVoip:tokenVoip username:username host:host port:@(port) remoteSsids:remoteSsids localSsid:localSsid tlsKeyHash:tlsKeyHash];
}

- (void)disableLPC {
  [_utils disableLPC];
}

- (void)playRBT:(BOOL)isLoudSpeaker {
  [_utils playRBT:isLoudSpeaker];
}

- (void)stopRBT:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [_utils stopRBT:resolve rejecter:reject];
}

- (void)systemUptimeMs:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [_utils systemUptimeMs:resolve rejecter:reject];
}

- (void)getRingtoneOptions:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [_utils getRingtoneOptions:resolve rejecter:reject];
}

- (void)validateRingtone:(NSString *)r u:(NSString *)u t:(NSString *)t h:(NSString *)h p:(NSString *)p resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [_utils validateRingtone:r username:u tenant:t host:h port:p resolver:resolve rejecter:reject];
}

- (void)permCheckOverlay:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@NO);
}

- (void)permRequestOverlay:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@NO);
}

- (void)permCheckIgnoringBatteryOptimizations:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@NO);
}

- (void)permRequestIgnoringBatteryOptimizations:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@NO);
}

- (void)permCheckAndroidLpc:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@NO);
}

- (void)permRequestAndroidLpc:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@NO);
}

- (void)permDefaultDialer:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@"");
}

- (void)getInitialNotifications:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(nil);
}

- (void)isLocked:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@NO);
}

- (void)backToBackground {
}

- (void)hasIncomingCallActivity:(NSString *)uuid resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@NO);
}

- (void)getIncomingCallPendingUserAction:(NSString *)uuid resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@"");
}

- (void)closeIncomingCall:(NSString *)uuid {
}

- (void)closeAllIncomingCalls {
}

- (void)clearProcessedPnIds {
}

- (void)setSignedInAccount:(NSString *)u t:(NSString *)t h:(NSString *)h p:(NSString *)p {
}

- (void)setPbxConfig:(NSString *)jsonStr {
}

- (void)setCallConfig:(NSString *)uuid jsonStr:(NSString *)jsonStr {
}

- (void)setIsAppActive:(BOOL)isAppActive isAppActiveLocked:(BOOL)isAppActiveLocked {
}

- (void)setTalkingAvatar:(NSString *)uuid url:(NSString *)url isLarge:(BOOL)isLarge urlInfo:(NSString *)urlInfo hc:(NSString *)hc {
}

- (void)setJsCallsSize:(NSInteger)n {
}

- (void)setRecordingStatus:(NSString *)uuid recording:(BOOL)recording {
}

- (void)setIsVideoCall:(NSString *)uuid isVideoCall:(BOOL)isVideoCall isMuted:(BOOL)isMuted {
}

- (void)setOnHold:(NSString *)uuid holding:(BOOL)holding {
}

- (void)setIsMute:(NSString *)uuid isMute:(BOOL)isMute {
}

- (void)setSpeakerStatus:(BOOL)isSpeakerOn {
}

- (void)setLocale:(NSString *)locale {
}

- (void)setPhoneappliEnabled:(BOOL)enabled {
}

- (void)setAiphoneNurseCallEnabled:(BOOL)enabled {
}

- (void)setWebviewLogEnabled:(BOOL)enabled {
}

- (void)onCallConnected:(NSString *)uuid {
}

- (void)onCallKeepAction:(NSString *)uuid action:(NSString *)action {
}

- (void)onPageCallManage:(NSString *)uuid {
}

- (void)getRingerMode:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@(-1));
}

- (void)insertCallLog:(NSString *)number type:(NSInteger)type {
}

- (void)setUserAgentConfig:(NSString *)userAgentConfig {
}

- (void)setAudioMode:(NSInteger)mode {
}

- (void)setRemoteStreams:(NSString *)uuid streams:(NSArray *)streams {
}

- (void)setStreamActive:(NSString *)uuid s:(JS::NativeBrekekeUtils::RemoteStream &)s {
}

- (void)setLocalStream:(NSString *)uuid streamUrl:(NSString *)streamUrl {
}

- (void)addStreamToView:(NSString *)uuid s:(JS::NativeBrekekeUtils::RemoteStream &)s {
}

- (void)removeStreamFromView:(NSString *)uuid vId:(NSString *)vId {
}

- (void)setOptionsRemoteStream:(NSString *)uuid d:(NSArray *)d {
}

- (void)startRingtone:(NSString *)r u:(NSString *)u t:(NSString *)t h:(NSString *)h p:(NSString *)p resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@NO);
}

- (void)stopRingtone:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@NO);
}

- (void)setShouldSkipPlayRingtone:(BOOL)s {
}

- (void)shouldPlayRingtone:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve(@NO);
}

- (void)updateRqStatus:(NSString *)uuid name:(NSString *)name isLoading:(BOOL)isLoading {
}

- (void)updateConnectionStatus:(NSString *)msg isConnFailure:(BOOL)isConnFailure {
}

- (void)updateAnyHoldLoading:(BOOL)isAnyHoldLoading {
}

- (void)toast:(NSString *)uuid m:(NSString *)m d:(NSString *)d t:(NSString *)t {
}

@end