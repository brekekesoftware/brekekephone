import { NativeModule, NativeModules, Platform } from 'react-native'

import { TCallkeepAction } from '../stores/callStore'
import NativeIos from './RnNativeIos'

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
    setTalkingAvatar: () => undefined,
    setIsVideoCall: () => undefined,
    setRemoteVideoStreamURL: () => undefined,
    setOnHold: () => undefined,
    setJsCallsSize: () => undefined,
    setLocale: () => undefined,
    onCallConnected: () => undefined,
    onCallKeepAction: () => undefined,
    setOnSwitchCamera: () => undefined,
    playRBT: () => undefined,
    stopRBT: () => undefined,
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
    setTalkingAvatar(uuid: string, url: string, isLarge: boolean): void
    setIsVideoCall(uuid: string, isVideoCall: boolean): void
    setRemoteVideoStreamURL(uuid: string, url: string): void
    setOnHold(uuid: string, holding: boolean): void
    setJsCallsSize(n: number): void
    setLocale(locale: string): void
    onCallConnected(uuid: string): void
    onCallKeepAction(uuid: string, action: TCallkeepAction): void
    setOnSwitchCamera(uuid: string, isFrontCamera: boolean): void
    playRBT(): void
    stopRBT(): void
  }
}
export const RnNativeModules = M
export const BrekekeUtils = Platform.OS === 'ios' ? NativeIos : M.BrekekeUtils
