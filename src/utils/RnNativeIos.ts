import { NativeModules } from 'react-native'

import { TCallkeepAction } from '../stores/callStore'

const { BrekekeUtils } = NativeModules
interface BrekekeUtilsInterface {
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
export default BrekekeUtils as BrekekeUtilsInterface
