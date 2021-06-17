import { NativeModule, NativeModules, Platform } from 'react-native'

const Polyfill = {
  IncomingCall: {
    closeIncomingCallActivity() {},
    showCall() {},
    setOnHold() {},
  },
}
const M = (Platform.OS === 'android' ? NativeModules : Polyfill) as {
  IncomingCall: NativeModule & {
    closeIncomingCallActivity(isAnswerPressed: boolean, uuid?: string): void
    showCall(uuid: string, callerName: string, withVideo?: boolean): void
    setOnHold(uuid: string, callerName: boolean): void
  }
}

export const RnNativeModules = M

export const IncomingCall = {
  closeIncomingCallActivity: (isAnswerPressed?: boolean, uuid?: string) =>
    M.IncomingCall.closeIncomingCallActivity(!!isAnswerPressed, uuid),
  showCall: M.IncomingCall.showCall,
  setOnHold: M.IncomingCall.setOnHold,
}
