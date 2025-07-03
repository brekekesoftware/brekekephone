#import "RingtoneModule.h"
#import <React/RCTLog.h>

@implementation RingtoneModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setRingtoneForAccount:(NSString *)accountId
                  ringtoneName:(NSString *)ringtoneName)
{
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  [defaults setObject:ringtoneName forKey:accountId];
  [defaults synchronize];
}

RCT_EXPORT_METHOD(removeRingtoneForAccount:(NSString *)accountId)
{
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  [defaults removeObjectForKey:accountId];
  [defaults synchronize];
}

RCT_EXPORT_METHOD(getRingtoneList:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSMutableArray *ringtoneList = [NSMutableArray array];

  NSArray *extensions = @[@"mp3", @"wav", @"m4a"]; // supported formats
  NSFileManager *fileManager = [NSFileManager defaultManager];

  NSString *resourcePath = [[NSBundle mainBundle] resourcePath];
  NSError *error = nil;
  NSArray *files = [fileManager contentsOfDirectoryAtPath:resourcePath error:&error];

  if (error) {
    reject(@"READ_ERROR", @"Unable to read bundle resources", error);
    return;
  }

  for (NSString *file in files) {
    NSString *ext = [[file pathExtension] lowercaseString];
    NSString *name = [file stringByDeletingPathExtension];

    if ([extensions containsObject:ext] && ![name.lowercaseString isEqualToString:@"ca"]) {
      [ringtoneList addObject:name];
    }
  }

  resolve(ringtoneList);
}



@end
