#import "Bridging-Header.h"
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE (BrekekeUtils, NSObject)
RCT_EXTERN_METHOD(systemUptimeMs
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(playRBT)
RCT_EXTERN_METHOD(stopRBT)
@end
