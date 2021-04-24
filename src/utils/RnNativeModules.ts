import { NativeModule, NativeModules, Platform } from 'react-native'

const Polyfill = {
  IncomingCall: {
    closeIncomingCallActivity() {},
    showCall() {},
  },
}
const M = (Platform.OS === 'android' ? NativeModules : Polyfill) as {
  IncomingCall: NativeModule & {
    closeIncomingCallActivity(checkPhoneLocked: boolean): void
    showCall(uuid: string, callerName: string, withVideo?: boolean): void
  }
}

export const RnNativeModules = M

export const IncomingCall = {
  closeIncomingCallActivity: (checkPhoneLocked?: boolean) =>
    M.IncomingCall.closeIncomingCallActivity(!!checkPhoneLocked),
  showCall: M.IncomingCall.showCall,
}
