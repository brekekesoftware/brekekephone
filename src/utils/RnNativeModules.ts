import { NativeModule, NativeModules, Platform } from 'react-native'

const Polyfill = {
  IncomingCall: {
    closeIncomingCallActivity() {},
    showCall() {},
  },
}
const M = Platform.OS === 'android' ? NativeModules : Polyfill

export const RnNativeModules = M as {
  IncomingCall: NativeModule & {
    closeIncomingCallActivity(): void
    showCall(uuid: string, callerName: string, withVideo?: boolean): void
  }
}
