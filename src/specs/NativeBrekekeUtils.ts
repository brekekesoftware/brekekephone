import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes'

type RemoteStream = {
  vId: string
  streamUrl: string
}
type RemoteStreamOption = {
  vId: string
  enableVideo: boolean
}
export interface Spec extends TurboModule {
  permCheckOverlay(): Promise<boolean>
  permRequestOverlay(): Promise<boolean>
  permCheckIgnoringBatteryOptimizations(): Promise<boolean>
  permRequestIgnoringBatteryOptimizations(): Promise<boolean>
  permCheckAndroidLpc(): Promise<boolean>
  permRequestAndroidLpc(): Promise<boolean>
  permDefaultDialer(): Promise<string>
  getInitialNotifications(): Promise<string | null>
  isLocked(): Promise<boolean>
  backToBackground(): void
  hasIncomingCallActivity(uuid: string): Promise<boolean>
  getIncomingCallPendingUserAction(uuid: string): Promise<string>
  closeIncomingCall(uuid: string): void
  closeAllIncomingCalls(): void
  clearProcessedPnIds(): void
  setSignedInAccount(u: string, t: string, h: string, p: string): void
  setPbxConfig(jsonStr: string): void
  setCallConfig(uuid: string, jsonStr: string): void
  setIsAppActive(isAppActive: boolean, isAppActiveLocked: boolean): void
  setTalkingAvatar(
    uuid: string,
    url: string,
    isLarge: boolean,
    urlInfo: string,
    hc: string,
  ): void
  setJsCallsSize(n: Int32): void
  setRecordingStatus(uuid: string, recording: boolean): void
  setIsVideoCall(uuid: string, isVideoCall: boolean, isMuted: boolean): void
  setOnHold(uuid: string, holding: boolean): void
  setIsMute(uuid: string, isMute: boolean): void
  setSpeakerStatus(isSpeakerOn: boolean): void
  setLocale(locale: string): void
  setPhoneappliEnabled(enabled: boolean): void
  setAiphoneNurseCallEnabled(enabled: boolean): void
  setWebviewLogEnabled(enabled: boolean): void
  onCallConnected(uuid: string): void
  onCallKeepAction(uuid: string, action: string): void
  onPageCallManage(uuid: string): void
  getRingerMode(): Promise<number>
  insertCallLog(number: string, type: Int32): void
  setUserAgentConfig(userAgentConfig: string): void
  setAudioMode(mode: Int32): void
  setRemoteStreams(uuid: string, streams: RemoteStream[]): void
  setStreamActive(uuid: string, s: RemoteStream): void
  setLocalStream(uuid: string, streamUrl: string): void
  addStreamToView(uuid: string, s: RemoteStream): void
  removeStreamFromView(uuid: string, vId: string): void
  setOptionsRemoteStream(uuid: string, d: RemoteStreamOption[]): void
  getRingtoneOptions(): Promise<string[]>
  startRingtone(
    r: string,
    u: string,
    t: string,
    h: string,
    p: string,
  ): Promise<boolean>
  stopRingtone(): Promise<boolean>
  setShouldSkipPlayRingtone(s: boolean): void
  shouldPlayRingtone(): Promise<boolean>
  updateRqStatus(uuid: string, name: string, isLoading: boolean): void
  updateConnectionStatus(msg: string, isConnFailure: boolean): void
  updateAnyHoldLoading(isAnyHoldLoading: boolean): void
  toast(uuid: string, m: string, d: string, t: string): void
  webrtcSetAudioEnabled(enabled: boolean, action?: string): void
  playRBT(isLoudSpeaker: boolean): void
  stopRBT(): Promise<void>
  setProximityMonitoring(enabled: boolean): void
  isSpeakerOn(): Promise<boolean>
  resetAudioConfig(): void
  enableLPC(
    token: string,
    tokenVoip: string,
    username: string,
    host: string,
    port: Int32,
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
  clearAppCache(): Promise<boolean>
}
export default TurboModuleRegistry.get<Spec>('BrekekeUtils')
