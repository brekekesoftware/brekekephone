import { get, set } from 'lodash'
import type { NativeModule } from 'react-native'
import { NativeModules, Platform } from 'react-native'

import type { TCallKeepAction } from '../stores/callStore2'

export enum CallLogType {
  INCOMING_TYPE = 1,
  OUTGOING_TYPE = 2,
  MISSED_TYPE = 3,
}

type TBrekekeUtils = {
  // these methods only available on android
  checkPermissionDefaultDialer(): Promise<string>
  getInitialNotifications(): Promise<string | null>
  isLocked(): Promise<boolean>
  startRingtone(): void
  stopRingtone(): void
  backToBackground(): void
  hasIncomingCallActivity(uuid: string): Promise<boolean>
  getIncomingCallPendingUserAction(uuid: string): Promise<string>
  closeIncomingCall(uuid: string): void
  closeAllIncomingCalls(): void
  setPbxConfig(jsonStr: string): void
  setCallConfig(uuid: string, jsonStr: string): void
  setIsAppActive(isAppActive: boolean, isAppActiveLocked: boolean): void
  setTalkingAvatar(uuid: string, url: string, isLarge: boolean): void
  setJsCallsSize(n: number): void
  setRecordingStatus(uuid: string, recording: boolean): void
  setIsVideoCall(uuid: string, isVideoCall: boolean): void
  setRemoteVideoStreamUrl(uuid: string, url: string): void
  setIsFrontCamera(uuid: string, isFrontCamera: boolean): void
  setOnHold(uuid: string, holding: boolean): void
  setIsMute(uuid: string, isMute: boolean): void
  setSpeakerStatus(isSpeakerOn: boolean): void
  setLocale(locale: string): void
  setPhoneappliEnabled(enabled: boolean): void
  onCallConnected(uuid: string): void
  onCallKeepAction(uuid: string, action: TCallKeepAction): void
  onPageCallManage(uuid: string): void
  getRingerMode(): Promise<number>
  insertCallLog(number: string, type: CallLogType): void
  isOverlayPermissionGranted(): Promise<boolean>
  isDisableBatteryOptimizationGranted(): boolean
  perDisableBatteryOptimization(): Promise<number>
  perOverlay(): void
  // these methods only available on ios
  webrtcSetAudioEnabled(enabled: boolean): void
  playRBT(): void
  stopRBT(): void
  enableLPC(
    token: string,
    tokenVoip: string,
    username: string,
    host: string,
    port: number,
    remoteSsids: string[],
    localSsid: string,
    tlsKeyHash: string,
  ): void
  disableLPC(): void

  // these methods available on both
  systemUptimeMs(): Promise<number>
}

export type TNativeModules = {
  BrekekeUtils: NativeModule & TBrekekeUtils
}

const Polyfill: TBrekekeUtils = {
  checkPermissionDefaultDialer: () => Promise.resolve(''),
  getInitialNotifications: () => Promise.resolve(null),
  isLocked: () => Promise.resolve(false),
  startRingtone: () => undefined,
  stopRingtone: () => undefined,
  backToBackground: () => undefined,
  hasIncomingCallActivity: () => Promise.resolve(false),
  getIncomingCallPendingUserAction: () => Promise.resolve(''),
  closeIncomingCall: () => undefined,
  closeAllIncomingCalls: () => undefined,
  setPbxConfig: () => undefined,
  setCallConfig: () => undefined,
  setIsAppActive: () => undefined,
  setTalkingAvatar: () => undefined,
  setJsCallsSize: () => undefined,
  setRecordingStatus: () => undefined,
  setIsVideoCall: () => undefined,
  setRemoteVideoStreamUrl: () => undefined,
  setIsFrontCamera: () => undefined,
  setOnHold: () => undefined,
  setIsMute: () => undefined,
  setSpeakerStatus: () => undefined,
  setLocale: () => undefined,
  setPhoneappliEnabled: () => undefined,
  onCallConnected: () => undefined,
  onCallKeepAction: () => undefined,
  onPageCallManage: () => undefined,
  getRingerMode: () => Promise.resolve(-1),
  insertCallLog: () => undefined,
  isOverlayPermissionGranted: () => Promise.resolve(false),
  isDisableBatteryOptimizationGranted: () => false,
  perDisableBatteryOptimization: () => Promise.resolve(0),
  perOverlay: () => undefined,
  // these methods only available on ios
  webrtcSetAudioEnabled: () => undefined,
  playRBT: () => undefined,
  stopRBT: () => undefined,
  enableLPC: () => undefined,
  disableLPC: () => undefined,

  // these methods available on both
  systemUptimeMs: () => Promise.resolve(-1),
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

// add polyfill
Object.keys(Polyfill)
  .filter(k => typeof get(BrekekeUtils, k) !== 'function')
  .forEach(k => {
    set(BrekekeUtils, k, get(Polyfill, k))
  })
