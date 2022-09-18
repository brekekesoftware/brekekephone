#include <sys/sysctl.h>
#include <sys/types.h>

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
  } @catch (NSException *e) {
    NSLog(@"BrekekeUtils.playRBT() error: %@", e.reason);
  }
}

RCT_EXPORT_METHOD(stopRBT) {
  NSLog(@"BrekekeUtils.stopRBT()");
  @try {
    if (audio != nil) {
      [audio stop];
      audio = nil;
    }
  } @catch (NSException *e) {
    NSLog(@"BrekekeUtils.stopRBT() error: %@", e.reason);
  }
}

RCT_REMAP_METHOD(systemUptimeMs, resolver
                 : (RCTPromiseResolveBlock)resolve rejecter
                 : (RCTPromiseRejectBlock)reject) {
  NSLog(@"BrekekeUtils.systemUptimeMs()");
  @try {
    int a[2];
    a[0] = CTL_KERN;
    a[1] = KERN_BOOTTIME;
    struct timeval t;
    size_t s = sizeof(t);
    if (sysctl(a, 2, &t, &s, NULL, 0) != -1) {
      time_t now;
      (void)time(&now);
      resolve(@((now - t.tv_sec) * 1000));
    } else {
      resolve(@(-1));
    }
  } @catch (NSException *e) {
    NSLog(@"BrekekeUtils.systemUptimeMs() error: %@", e.reason);
    resolve(@(-1));
  }
}

@end
