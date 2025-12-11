import { get, set } from 'lodash'
import type { NativeModule } from 'react-native'
import { NativeModules } from 'react-native'

import { isWeb } from '#/config'
import type { TCallKeepAction } from '#/stores/callStore'

type TBrekekeUtils = {
  // ==========================================================================
  // these methods only available on android
  // android permissions
  permCheckOverlay(): Promise<boolean>
  permRequestOverlay(): Promise<boolean>
  permCheckIgnoringBatteryOptimizations(): Promise<boolean>
  permRequestIgnoringBatteryOptimizations(): Promise<boolean>
  permCheckAndroidLpc(): Promise<boolean>
  permRequestAndroidLpc(): Promise<boolean>
  permDefaultDialer(): Promise<string>
  // android initial notifications
  // rn might not be available yet so need to cache and get from js side
  getInitialNotifications(): Promise<string | null>
  //
  isLocked(): Promise<boolean>
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
  setIsVideoCall(uuid: string, isVideoCall: boolean, isMuted: boolean): void
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
  setUserAgentConfig(userAgentConfig: string): void
  setAudioMode: (mode: number) => void
  // android video conference
  setRemoteStreams: (uuid: string, streams: RemoteStream[]) => void
  setStreamActive: (uuid: string, s: RemoteStream) => void
  setLocalStream: (uuid: string, streamUrl: string) => void
  addStreamToView: (uuid: string, s: RemoteStream) => void
  removeStreamFromView: (uuid: string, vId: string) => void
  setOptionsRemoteStream: (uuid: string, d: RemoteStreamOption[]) => void
  // android ringtone
  getRingtoneOptions(): Promise<string[]>
  startRingtone(
    r: string,
    u: string,
    t: string,
    h: string,
    p: string,
  ): Promise<boolean>
  stopRingtone(): Promise<boolean>
  // android pending cache and retry pal
  updateRqStatus(uuid: string, name: string, isLoading: boolean): void
  updateConnectionStatus(msg: string, isConnFailure: boolean): void
  updateAnyHoldLoading(isAnyHoldLoading: boolean): void
  toast(
    uuid: string,
    m: string,
    d: string,
    t: 'success' | 'error' | 'warning' | 'info',
  ): void

  // ==========================================================================
  // these methods only available on ios
  webrtcSetAudioEnabled(enabled: boolean, action?: string): void
  playRBT(isLoudSpeaker: boolean): void
  stopRBT(): Promise<void>
  setProximityMonitoring(enabled: boolean): void
  isSpeakerOn(): Promise<boolean>
  resetAudioConfig(): void

  // ==========================================================================
  // these methods available on both
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
  systemUptimeMs(): Promise<number>
  validateRingtone(
    r: string,
    u: string,
    t: string,
    h: string,
    p: string,
  ): Promise<string>
}

export type TNativeModules = {
  BrekekeUtils: NativeModule & TBrekekeUtils
  BrekekeEmitter: NativeModule | null
}

const Polyfill: TBrekekeUtils = {
  // ==========================================================================
  // these methods only available on android
  // android permissions
  permCheckOverlay: () => Promise.resolve(false),
  permRequestOverlay: () => Promise.resolve(false),
  permCheckIgnoringBatteryOptimizations: () => Promise.resolve(false),
  permRequestIgnoringBatteryOptimizations: () => Promise.resolve(false),
  permCheckAndroidLpc: () => Promise.resolve(false),
  permRequestAndroidLpc: () => Promise.resolve(false),
  permDefaultDialer: () => Promise.resolve(''),
  // android initial notifications
  // rn might not be available yet so need to cache and get from js side
  getInitialNotifications: () => Promise.resolve(null),
  //
  isLocked: () => Promise.resolve(false),
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
  setUserAgentConfig: () => undefined,
  setAudioMode: () => undefined,
  // android video conference
  setRemoteStreams: () => undefined,
  setStreamActive: () => undefined,
  setLocalStream: () => undefined,
  addStreamToView: () => undefined,
  removeStreamFromView: () => undefined,
  setOptionsRemoteStream: () => undefined,
  // android ringtone
  getRingtoneOptions: () => Promise.resolve(staticRingtones as any),
  startRingtone: () => Promise.resolve(false),
  stopRingtone: () => Promise.resolve(false),
  // android pending cache and retry pal
  updateRqStatus: () => undefined,
  updateConnectionStatus: () => undefined,
  updateAnyHoldLoading: () => undefined,
  toast: () => undefined,

  // ==========================================================================
  // these methods only available on ios
  webrtcSetAudioEnabled: () => undefined,
  playRBT: () => undefined,
  stopRBT: () => Promise.resolve(),
  setProximityMonitoring: () => undefined,
  isSpeakerOn: () => Promise.resolve(false),
  resetAudioConfig: () => undefined,

  // ==========================================================================
  // these methods available on both
  enableLPC: () => undefined,
  disableLPC: () => undefined,
  systemUptimeMs: () => Promise.resolve(-1),
  validateRingtone: () => Promise.resolve(''),
}

const M = NativeModules as TNativeModules
export const BrekekeUtils = M.BrekekeUtils || Polyfill
export const BrekekeEmitter = M.BrekekeEmitter || null

if (__DEV__ && !isWeb) {
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

export enum CallLogType {
  INCOMING_TYPE = 1,
  OUTGOING_TYPE = 2,
  MISSED_TYPE = 3,
}

// same convention with default pbx tenant
export const defaultRingtone = '-'
// same with _static in native Ringtone.java
export const staticRingtones = [
  'incallmanager_ringtone',
  // strong typing to make sure not missing static ringtone mp3
] as const

export type RemoteStream = {
  vId: string
  streamUrl: string
}
export type RemoteStreamOption = Pick<RemoteStream, 'vId'> & {
  enableVideo: boolean
}
