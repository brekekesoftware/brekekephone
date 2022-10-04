import { get, set } from 'lodash'
import { NativeModule, NativeModules, Platform } from 'react-native'

import { TCallkeepAction } from '../stores/callStore'

type TBrekekeUtils = {
  // these methods only available on android
  getInitialNotifications(): Promise<string | null>
  isLocked(): Promise<boolean>
  isSilent(): Promise<boolean>
  backToBackground(): void
  getIncomingCallPendingUserAction(uuid: string): Promise<string>
  closeIncomingCall(uuid: string): void
  closeAllIncomingCalls(): void
  setIsAppActive(isAppActive: boolean, isAppActiveLocked: boolean): void
  setTalkingAvatar(uuid: string, url: string, isLarge: boolean): void
  setJsCallsSize(n: number): void
  setIsVideoCall(uuid: string, isVideoCall: boolean): void
  setRemoteVideoStreamURL(uuid: string, url: string): void
  setIsFrontCamera(uuid: string, isFrontCamera: boolean): void
  setOnHold(uuid: string, holding: boolean): void
  setLocale(locale: string): void
  onCallConnected(uuid: string): void
  onCallKeepAction(uuid: string, action: TCallkeepAction): void

  // these methods only available on ios
  playRBT(): void
  stopRBT(): void
  setConfig(
    deviceId: string,
    appId: string,
    deviceName: string,
    ssid: string,
    host: string,
  ): void
  makeCallLPC(): void
  endCallLPC(): void
  // these methods available on both
  systemUptimeMs(): Promise<number>
}

export type TNativeModules = {
  BrekekeUtils: NativeModule & TBrekekeUtils
}

const Polyfill: TBrekekeUtils = {
  getInitialNotifications: () => Promise.resolve(null),
  isLocked: () => Promise.resolve(false),
  isSilent: () => Promise.resolve(false),
  backToBackground: () => undefined,
  getIncomingCallPendingUserAction: () => Promise.resolve(''),
  closeIncomingCall: () => undefined,
  closeAllIncomingCalls: () => undefined,
  setIsAppActive: () => undefined,
  setTalkingAvatar: () => undefined,
  setJsCallsSize: () => undefined,
  setIsVideoCall: () => undefined,
  setRemoteVideoStreamURL: () => undefined,
  setIsFrontCamera: () => undefined,
  setOnHold: () => undefined,
  setLocale: () => undefined,
  onCallConnected: () => undefined,
  onCallKeepAction: () => undefined,
  playRBT: () => undefined,
  stopRBT: () => undefined,
  systemUptimeMs: () => Promise.resolve(-1),
  setConfig: () => undefined,
  makeCallLPC: () => undefined,
  endCallLPC: () => undefined,
}

const M = NativeModules as TNativeModules
export const BrekekeUtils = M.BrekekeUtils || Polyfill

if (__DEV__ && Platform.OS !== 'web') {
  const k = Object.keys(M.BrekekeUtils || {})
  console.log(
    `BrekekeUtils debug: found ${k.length} methods` +
      (k.length ? `: ${k.join(', ')}` : ''),
  )
}

// Add polyfill
Object.keys(Polyfill)
  .filter(k => typeof get(BrekekeUtils, k) !== 'function')
  .forEach(k => {
    set(BrekekeUtils, k, get(Polyfill, k))
  })
