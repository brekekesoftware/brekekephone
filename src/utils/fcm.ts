import { NativeEventEmitter, Platform } from 'react-native'

import { RNFIRMessaging } from './RnNativeModules'

const EventEmitter = new NativeEventEmitter(RNFIRMessaging)

export const FCMEvent = {
  RefreshToken: 'FCMTokenRefreshed',
  Notification: 'FCMNotificationReceived',
  DirectChannelConnectionChanged: 'FCMDirectChannelConnectionChanged',
}

export const RemoteNotificationResult = {
  NewData: 'UIBackgroundFetchResultNewData',
  NoData: 'UIBackgroundFetchResultNoData',
  ResultFailed: 'UIBackgroundFetchResultFailed',
}

export const WillPresentNotificationResult = {
  All: 'UNNotificationPresentationOptionAll',
  None: 'UNNotificationPresentationOptionNone',
}

export const NotificationType = {
  Remote: 'remote_notification',
  NotificationResponse: 'notification_response',
  WillPresent: 'will_present_notification',
  Local: 'local_notification',
}

export const NotificationCategoryOption = {
  CustomDismissAction: 'UNNotificationCategoryOptionCustomDismissAction',
  AllowInCarPlay: 'UNNotificationCategoryOptionAllowInCarPlay',
  PreviewsShowTitle: 'UNNotificationCategoryOptionHiddenPreviewsShowTitle',
  PreviewsShowSubtitle:
    'UNNotificationCategoryOptionHiddenPreviewsShowSubtitle',
  None: 'UNNotificationCategoryOptionNone',
}

export const NotificationActionOption = {
  AuthenticationRequired: 'UNNotificationActionOptionAuthenticationRequired',
  Destructive: 'UNNotificationActionOptionDestructive',
  Foreground: 'UNNotificationActionOptionForeground',
  None: 'UNNotificationActionOptionNone',
}

export const NotificationActionType = {
  Default: 'UNNotificationActionTypeDefault',
  TextInput: 'UNNotificationActionTypeTextInput',
}

export const FCM = {
  getInitialNotification: () => {
    return RNFIRMessaging.getInitialNotification()
  },
  getFCMToken: () => {
    return RNFIRMessaging.getFCMToken()
  },
  getEntityFCMToken: () => {
    return RNFIRMessaging.getEntityFCMToken()
  },
  deleteEntityFCMToken: () => {
    return RNFIRMessaging.deleteEntityFCMToken()
  },
  deleteInstanceId: () => {
    return RNFIRMessaging.deleteInstanceId()
  },
  requestPermissions: () => {
    return RNFIRMessaging.requestPermissions()
  },
  createNotificationChannel: async (channel: object) => {
    if (Platform.OS === 'android') {
      return RNFIRMessaging.createNotificationChannel(channel)
    }
  },
  deleteNotificationChannel: async (channel: object) => {
    if (Platform.OS === 'android') {
      return RNFIRMessaging.deleteNotificationChannel(channel)
    }
  },
  presentLocalNotification: (details: NotificationDetails) => {
    details.id = details.id || new Date().getTime().toString()
    details.local_notification = true
    RNFIRMessaging.presentLocalNotification(details)
  },
  cancelLocalNotification: (notificationID: string) => {
    if (!notificationID) {
      return
    }
    RNFIRMessaging.cancelLocalNotification(notificationID)
  },
  cancelAllLocalNotifications: () => {
    RNFIRMessaging.cancelAllLocalNotifications()
  },
  removeDeliveredNotification: (notificationID: string) => {
    if (!notificationID) {
      return
    }
    RNFIRMessaging.removeDeliveredNotification(notificationID)
  },
  removeAllDeliveredNotifications: () => {
    RNFIRMessaging.removeAllDeliveredNotifications()
  },
  setBadgeNumber: (number: number) => {
    RNFIRMessaging.setBadgeNumber(number)
  },
  getBadgeNumber: () => {
    return RNFIRMessaging.getBadgeNumber()
  },
  on: (event: string, callback: Function) => {
    if (!Object.values(FCMEvent).includes(event)) {
      throw new Error(
        "Invalid FCM event subscription, use import {FCMEvent} from 'react-native-fcm' to avoid typo",
      )
    }
    if (event === FCMEvent.Notification) {
      return EventEmitter.addListener(
        event,
        async (data: NotificationDetails) => {
          data.finish = () => {} // ignore ios finish
          try {
            await callback(data)
          } catch (err) {
            console.error('Notification handler err:\n' + err.stack)
            throw err
          }
          if (!data._finishCalled) {
            data.finish()
          }
        },
      )
    }
    return EventEmitter.addListener(event, (...args: unknown[]) =>
      callback(...args),
    )
  },
  subscribeToTopic: (topic: string) => {
    RNFIRMessaging.subscribeToTopic(topic)
  },
  unsubscribeFromTopic: (topic: string) => {
    RNFIRMessaging.unsubscribeFromTopic(topic)
  },
}

export type NotificationDetails = {
  collapse_key?: string
  opened_from_tray?: boolean
  from?: string
  notification?: {
    title?: string
    body: string
    icon: string
  }
  fcm?: {
    action?: string
    tag?: string
    icon?: string
    color?: string
    body: string
    title?: string
  }
  local_notification?: boolean
  _notificationType?: string
  _actionIdentifier?: string
  _userText?: string
  finish?: (type?: string) => void
  _finishCalled?: boolean
  id?: string
  // type-coverage:ignore-next-line
  [key: string]: any
}
