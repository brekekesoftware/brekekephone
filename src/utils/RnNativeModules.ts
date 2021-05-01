import { NativeModule, NativeModules, Platform } from 'react-native'

const Polyfill = {
  IncomingCall: {
    closeIncomingCallActivity() {},
    showCall() {},
  },
}
const M = (Platform.OS === 'android' ? NativeModules : Polyfill) as {
  IncomingCall: NativeModule & {
    closeIncomingCallActivity(isAnswerPressed: boolean): void
    showCall(uuid: string, callerName: string, withVideo?: boolean): void
  }
}

export const RnNativeModules = M

export const IncomingCall = {
  closeIncomingCallActivity: (isAnswerPressed?: boolean) =>
    M.IncomingCall.closeIncomingCallActivity(!!isAnswerPressed),
  showCall: M.IncomingCall.showCall,
}
