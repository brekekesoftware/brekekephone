import {
  NativeModule,
  NativeModules,
  Platform,
  ViewPagerAndroidProps,
} from 'react-native'

import { NotificationDetails } from './fcm'

const Polyfill = {
  IncomingCall: {
    setLocale: () => undefined,
    setIsAppActive: () => undefined,
    closeIncomingCall: () => undefined,
    closeAllIncomingCalls: () => undefined,
    setIsVideoCall: () => undefined,
    setRemoteVideoStreamURL: () => undefined,
    setOnHold: () => undefined,
    setBackgroundCalls: () => undefined,
    isLocked: () => Promise.resolve(false),
    isSilent: () => Promise.resolve(false),
    backToBackground: () => undefined,
    onConnectingCallSuccess: () => undefined,
  },
}
const M = (
  Platform.OS === 'android' ? NativeModules : Polyfill
) as TNativeModules

export type TNativeModules = {
  IncomingCall: NativeModule & {
    setLocale(locale: string): void
    setIsAppActive(b1: boolean, b2: boolean): void
    closeIncomingCall(uuid: string): void
    closeAllIncomingCalls(): ViewPagerAndroidProps
    setIsVideoCall(uuid: string, isVideoCall: boolean): void
    setRemoteVideoStreamURL(uuid: string, url: string): void
    setOnHold(uuid: string, holding: boolean): void
    setBackgroundCalls(n: number): void
    isLocked(): Promise<boolean>
    isSilent(): Promise<boolean>
    backToBackground(): void
    onConnectingCallSuccess(uuid: string): void
    getPendingUserAction(uuid: string): Promise<string>
  }
  RNFIRMessaging: NativeModule & {
    getInitialNotifications(): Promise<string | null>
    getFCMToken(): Promise<string>
    getEntityFCMToken(): Promise<string>
    deleteEntityFCMToken(): Promise<void>
    deleteInstanceId(): Promise<void>
    requestPermissions(): Promise<void>
    subscribeToTopic(topic: string): void
    unsubscribeFromTopic(topic: string): void
    presentLocalNotification(notification: NotificationDetails): void
    removeAllDeliveredNotifications(): void
    removeDeliveredNotification(id: string): void
    cancelAllLocalNotifications(): void
    cancelLocalNotification(id: string): string
    setBadgeNumber(badge: number): void
    getBadgeNumber(): Promise<number>
    createNotificationChannel(config: object): Promise<void>
    deleteNotificationChannel(channel: object): Promise<void>
  }
}

export const RnNativeModules = M
export const IncomingCall = M.IncomingCall
export const RNFIRMessaging = M.RNFIRMessaging
