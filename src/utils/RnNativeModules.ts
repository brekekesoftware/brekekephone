import { NativeModule, NativeModules, Platform } from 'react-native'

const Polyfill = {
  IncomingCall: {
    closeIncomingCallActivity() {},
    closeAllIncomingCallActivities() {},
    showCall() {},
    setOnHold() {},
  },
}
const M = (Platform.OS === 'android' ? NativeModules : Polyfill) as {
  IncomingCall: NativeModule & {
    closeIncomingCallActivity(uuid: string): void
    closeAllIncomingCallActivities(): void
    showCall(
      uuid: string,
      callerName: string,
      withVideo: boolean,
      isAppActive: boolean,
    ): void
    setOnHold(uuid: string, holding: boolean): void
  }
}

export const RnNativeModules = M

export const IncomingCall = {
  closeIncomingCallActivity: (uuid: string) =>
    M.IncomingCall.closeIncomingCallActivity(uuid),
  closeAllIncomingCallActivities: M.IncomingCall.closeAllIncomingCallActivities,
  showCall: M.IncomingCall.showCall,
  setOnHold: M.IncomingCall.setOnHold,
}
