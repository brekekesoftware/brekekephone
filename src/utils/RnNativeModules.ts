import { get, set } from 'lodash'
import type { NativeModule } from 'react-native'
import { NativeModules } from 'react-native'

import { isWeb } from '#/config'
import type { TCallKeepAction } from '#/stores/callStore'

export enum CallLogType {
  INCOMING_TYPE = 1,
  OUTGOING_TYPE = 2,
  MISSED_TYPE = 3,
}

export type RingtoneSystemType = {
  title: string
  uri: string
}

export const defaultRingtone = 'default'

type TBrekekeUtils = {
  // these methods only available on android
  checkPermissionDefaultDialer(): Promise<string>
  getInitialNotifications(): Promise<string | null>
  isLocked(): Promise<boolean>
  startRingtone(
    username: string,
    tenant: string,
    host: string,
    port: string,
  ): void
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
  isOverlayPermissionGranted(): Promise<boolean>
  isDisableBatteryOptimizationGranted(): Promise<boolean>
  permDisableBatteryOptimization(): Promise<boolean>
  permOverlay(): Promise<boolean>
  setUserAgentConfig(userAgentConfig: string): void
  setAudioMode: (mode: number) => void
  // android video conference
  setRemoteStreams: (
    uuid: string,
    streams: Array<{ vId: string; streamUrl: string }>,
  ) => void
  setStreamActive: (uuid: string, s: { vId: string; streamUrl: string }) => void
  setLocalStream: (uuid: string, streamUrl: string) => void
  addStreamToView: (uuid: string, s: { vId: string; streamUrl: string }) => void
  removeStreamFromView: (uuid: string, vId: string) => void
  setOptionsRemoteStream: (
    uuid: string,
    d: Array<{ vId: string; enableVideo: boolean }>,
  ) => void
  // android pending cache and retry pal
  updateRqStatus(uuid: string, name: string, isLoading: boolean): void
  updateConnectionStatus(msg: string, isConnFailure: boolean): void
  toast(
    uuid: string,
    m: string,
    d: string,
    t: 'success' | 'error' | 'warning' | 'info',
  ): void
  updateAnyHoldLoading(isAnyHoldLoading: boolean): void
  // android lpc
  androidLpcIsPermGranted(): Promise<boolean>
  androidLpcPermIncomingCall(): Promise<boolean>

  // these methods only available on ios
  webrtcSetAudioEnabled(enabled: boolean): void
  playRBT(isLoudSpeaker: boolean): void
  stopRBT(): Promise<void>
  setProximityMonitoring(enabled: boolean): void

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

  // ringtone
  getRingtoneOptions(): Promise<RingtoneSystemType[]>
  playRingtoneByName(name: string): void
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
  isDisableBatteryOptimizationGranted: () => Promise.resolve(false),
  permDisableBatteryOptimization: () => Promise.resolve(false),
  permOverlay: () => Promise.resolve(false),
  setUserAgentConfig: () => undefined,
  setAudioMode: () => undefined,
  // android video conference
  setRemoteStreams: () => undefined,
  setStreamActive: () => undefined,
  setLocalStream: () => undefined,
  addStreamToView: () => undefined,
  removeStreamFromView: () => undefined,
  setOptionsRemoteStream: () => undefined,
  // android pending cache and retry pal
  updateRqStatus: () => undefined,
  updateConnectionStatus: () => undefined,
  toast: () => undefined,
  updateAnyHoldLoading: () => undefined,
  // android lpc
  androidLpcIsPermGranted: () => Promise.resolve(false),
  androidLpcPermIncomingCall: () => Promise.resolve(false),

  // these methods only available on ios
  webrtcSetAudioEnabled: () => undefined,
  playRBT: () => undefined,
  stopRBT: () => Promise.resolve(),
  setProximityMonitoring: () => undefined,

  // these methods available on both
  enableLPC: () => undefined,
  disableLPC: () => undefined,
  systemUptimeMs: () => Promise.resolve(-1),

  // ringtone
  getRingtoneOptions: () => Promise.resolve([]),
  playRingtoneByName: () => undefined,
}

const M = NativeModules as TNativeModules
export const BrekekeUtils = M.BrekekeUtils || Polyfill

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
