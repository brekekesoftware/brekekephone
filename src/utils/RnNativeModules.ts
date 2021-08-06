import { NativeModule, NativeModules, Platform } from 'react-native'

const Polyfill = {
  IncomingCall: {
    closeIncomingCallActivity: () => undefined,
    closeAllIncomingCallActivities: () => undefined,
    showCall: () => undefined,
    setOnHold: () => undefined,
    setBackgroundCalls: () => undefined,
    isLocked: () => Promise.resolve(false),
    backToBackground: () => undefined,
    onConnectingCallSuccess: () => undefined,
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
    setBackgroundCalls(n: number): void
    isLocked(): Promise<boolean>
    backToBackground(): void
    onConnectingCallSuccess(uuid: string): void
  }
}

export const RnNativeModules = M
export const IncomingCall = M.IncomingCall
