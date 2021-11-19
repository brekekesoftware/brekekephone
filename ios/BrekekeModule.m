//
//  BrekekeModule.m
//  BrekekePhone
//
//  Created by ThangNT on 17/11/2021.
//

#import <AVFoundation/AVFoundation.h>
#import "BrekekeModule.h"

@implementation BrekekeModule

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(switchState:(BOOL *)newState)
{
    if ([AVCaptureDevice class]) {
        AVCaptureDevice *device = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
        if ([device hasTorch]){
            [device lockForConfiguration:nil];

            if (newState) {
                [device setTorchMode:AVCaptureTorchModeOn];
            } else {
                [device setTorchMode:AVCaptureTorchModeOff];
            }

            [device unlockForConfiguration];
        }
    }
}

@end
