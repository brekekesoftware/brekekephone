import { NativeModule, NativeModules, Platform } from 'react-native'

const Polyfill = {
  BrekekeUtils: {
    getInitialNotifications: () => undefined,
    isLocked: () => Promise.resolve(false),
    isSilent: () => Promise.resolve(false),
    backToBackground: () => undefined,
    getIncomingCallPendingUserAction: () => Promise.resolve(''),
    closeIncomingCall: () => undefined,
    closeAllIncomingCalls: () => undefined,
    setIsAppActive: () => undefined,
    setConnectingCallSuccess: () => undefined,
    setIsVideoCall: () => undefined,
    setRemoteVideoStreamURL: () => undefined,
    setOnHold: () => undefined,
    setBackgroundCalls: () => undefined,
    setLocale: () => undefined,
  },
}
const M = (
  Platform.OS === 'android' ? NativeModules : Polyfill
) as TNativeModules

export type TNativeModules = {
  BrekekeUtils: NativeModule & {
    getInitialNotifications(): Promise<string | null>
    isLocked(): Promise<boolean>
    isSilent(): Promise<boolean>
    backToBackground(): void
    getIncomingCallPendingUserAction(uuid: string): Promise<string>
    closeIncomingCall(uuid: string): void
    closeAllIncomingCalls(): void
    setIsAppActive(b1: boolean, b2: boolean): void
    setConnectingCallSuccess(uuid: string): void
    setIsVideoCall(uuid: string, isVideoCall: boolean): void
    setRemoteVideoStreamURL(uuid: string, url: string): void
    setOnHold(uuid: string, holding: boolean): void
    setBackgroundCalls(n: number): void
    setLocale(locale: string): void
  }
}

export const RnNativeModules = M
export const BrekekeUtils = M.BrekekeUtils
