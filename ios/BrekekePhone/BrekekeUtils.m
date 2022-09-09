//
//  BrekekeUtils.m
//  BrekekePhone
//
//  Created by ThangNT on 29/08/2022.
//

#import "BrekekeUtils.h"
#import <AVFoundation/AVFoundation.h>
#import <AudioToolbox/AudioToolbox.h>

@implementation BrekekeUtils

AVAudioPlayer *audio;
AVAudioSession *audioSession;

RCT_EXPORT_MODULE();

- (instancetype)init {
  if (self = [super init]) {
    audio = nil;
    audioSession = [AVAudioSession sharedInstance];
  }
  NSLog(@"BrekekeUtils.init(): initialized");
  return self;
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

RCT_EXPORT_METHOD(playRBT) {
  NSLog(@"BrekekeUtils.playRBT()");
  @try {
    if (audio != nil) {
      if ([audio isPlaying]) {
        NSLog(@"startRingback(): is already playing");
        return;
      } else {
        [self stopRBT];
      }
    }
    NSString *soundFilePath =
        [NSString stringWithFormat:@"%@/incallmanager_ringback.mp3",
                                   [[NSBundle mainBundle] resourcePath]];
    NSURL *soundFileURL = [NSURL fileURLWithPath:soundFilePath];
    if (soundFileURL == nil) {
      NSLog(@"startRingback(): no media file");
      return;
    }
    audio = [[AVAudioPlayer alloc] initWithContentsOfURL:soundFileURL
                                                   error:nil];
    audio.delegate = self;
    audio.numberOfLoops = -1;
    [audio prepareToPlay];
    [audioSession setCategory:AVAudioSessionCategoryPlayAndRecord error:nil];
    [audio play];
  } @catch (NSException *exception) {
    NSLog(@"BrekekeUtils.playRBT() error: %@", exception.reason);
  }
}

RCT_EXPORT_METHOD(stopRBT) {
  NSLog(@"BrekekeUtils.stopRBT()");
  @try {
    if (audio != nil) {
      [audio stop];
      audio = nil;
    }
  } @catch (NSException *exception) {
    NSLog(@"BrekekeUtils.stopRBT() error: %@", exception.reason);
  }
}
@end
