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
    closeIncomingCallActivity(uuid: string, isAnswerPressed: boolean): void
    closeAllIncomingCallActivities(): void
    showCall(uuid: string, callerName: string, withVideo?: boolean): void
    setOnHold(uuid: string, holding: boolean): void
  }
}

export const RnNativeModules = M

export const IncomingCall = {
  closeIncomingCallActivity: (uuid: string, isAnswerPressed?: boolean) =>
    M.IncomingCall.closeIncomingCallActivity(uuid, !!isAnswerPressed),
  closeAllIncomingCallActivities: M.IncomingCall.closeAllIncomingCallActivities,
  showCall: M.IncomingCall.showCall,
  setOnHold: M.IncomingCall.setOnHold,
}
