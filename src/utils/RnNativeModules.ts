import { NativeModule, NativeModules, Platform } from 'react-native'

import { NotificationDetails } from './fcm'

const Polyfill = {
  IncomingCall: {
    closeIncomingCallActivity: () => undefined,
    closeAllIncomingCallActivities: () => undefined,
    showCall: () => undefined,
    setOnHold: () => undefined,
    setBackgroundCalls: () => undefined,
    isLocked: () => Promise.resolve(false),
    backToBackground: () => undefined,
  },
}
const M = (
  Platform.OS === 'android' ? NativeModules : Polyfill
) as TNativeModules

export type TNativeModules = {
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
  }
  RNFIRMessaging: NativeModule & {
    getInitialNotification: () => Promise<string | null>
    getFCMToken: () => Promise<string>
    getEntityFCMToken: () => Promise<string>
    deleteEntityFCMToken: () => Promise<void>
    deleteInstanceId: () => Promise<void>
    requestPermissions: () => Promise<void>
    subscribeToTopic: (topic: string) => void
    unsubscribeFromTopic: (topic: string) => void

    presentLocalNotification: (notification: NotificationDetails) => void

    removeAllDeliveredNotifications: () => void
    removeDeliveredNotification: (id: string) => void

    cancelAllLocalNotifications: () => void
    cancelLocalNotification: (id: string) => string

    setBadgeNumber: (badge: number) => void
    getBadgeNumber: () => Promise<number>

    createNotificationChannel: (config: object) => Promise<void>
    deleteNotificationChannel: (channel: object) => Promise<void>
  }
}

export const RnNativeModules = M
export const IncomingCall = M.IncomingCall
