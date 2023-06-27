import './callkeep'

import { AppRegistry } from 'react-native'
import {
  Notification,
  NotificationCompletion,
  Notifications,
  Registered,
  RegistrationError,
} from 'react-native-notifications'

import { intlDebug } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'
import { parse } from './PushNotification-parse'
import { BrekekeUtils } from './RnNativeModules'

let fcmPnToken = ''
const onToken = (t: string) => {
  if (t) {
    fcmPnToken = t
  }
}

const onNotification = async (
  n0: { [k: string]: unknown },
  initApp: Function,
) => {
  try {
    await initApp()
    // flush initial notification
    if (!n0?.callkeepUuid) {
      getInitialNotifications().then(ns =>
        ns.forEach(n => onNotification(n, initApp)),
      )
    }
    const n = await parse(n0)
    if (!n) {
      return
    }
  } catch (err) {
    console.error('PushNotification.android.ts onNotification error:', err)
  }
}

export const PushNotification = {
  getToken: () => {
    return Promise.resolve(fcmPnToken)
  },
  register: async (initApp: Function) => {
    try {
      initApp()
      const hasPermissions: boolean =
        await Notifications.isRegisteredForRemoteNotifications()

      if (!hasPermissions) {
        throw new Error("Don't have Permissions")
      }

      await Notifications.registerRemoteNotifications()

      await Notifications.events().registerRemoteNotificationsRegistered(
        (event: Registered) => {
          onToken(event.deviceToken)
        },
      )

      Notifications.events().registerRemoteNotificationsRegistrationFailed(
        (event: RegistrationError) => {
          console.error('Failed to register  remote notification', event)
        },
      )

      // set notification channel for normal case
      Notifications.setNotificationChannel({
        // have to set channel default
        // https://github.com/wix/react-native-notifications/issues/869#issuecomment-1157869452
        channelId: 'default',
        name: 'Brekeke Phone',
        importance: 5,
        description: 'Brekeke Phone notification channel',
        // enableLights: true,
        enableVibration: true,
        // optional
        // groupId: 'my-group',
        // optional, will be presented in Android OS notification permission
        // groupName: 'My Group',
        // showBadge: true,
        // place this in android/app/src/main/res/raw/ding.mp3
        // soundFile: 'ding.mp3',
        vibrationPattern: [200, 1000, 500, 1000, 500],
      })

      // set notification channel for chat
      Notifications.setNotificationChannel({
        channelId: 'brekeke_chat',
        name: 'Brekeke Phone',
        importance: 5,
        description: 'Brekeke Phone notification chat channel ',
        // enableLights: true,
        enableVibration: true,
        // groupId: 'my-group',
        // groupName: 'My Group',
        // showBadge: true,
        soundFile: 'ding.mp3',
        vibrationPattern: [200, 1000, 500, 1000, 500],
      })

      // handle received PN
      Notifications.events().registerNotificationReceivedForeground(
        (
          notification: Notification,
          completion: (response: NotificationCompletion) => void,
        ) => {
          onNotification(notification.payload, initApp)
        },
      )

      Notifications.events().registerNotificationOpened(
        (notification: Notification, completion: () => void, action: any) => {
          const payload = notification.payload?.payload || notification?.payload
          onNotification(payload, initApp)
        },
      )

      Notifications.events().registerNotificationReceivedBackground(
        (notification: Notification) => {
          onNotification(notification.payload, initApp)
        },
      )
      // if the app was launched by a push notification
      // this promise resolves to an object of type Notification
      await Notifications.getInitialNotification().then(n => {
        onNotification(n?.payload, initApp)
      })
    } catch (err) {
      RnAlert.error({
        message: intlDebug`Failed to initialize push notification`,
        err: err as Error,
      })
    }
  },
  resetBadgeNumber: () => {
    // TODO
  },
}

// TODO
// { callUUID, handle, name }
AppRegistry.registerHeadlessTask('RNCallKeepBackgroundMessage', () => () => {
  // https://github.com/react-native-webrtc/react-native-callkeep/blob/master/docs/android-installation.md
  return Promise.resolve(undefined)
})

const getInitialNotifications = async () => {
  const n = await BrekekeUtils.getInitialNotifications()
  if (!n) {
    return []
  }
  try {
    return (JSON.parse(n) as string[]).map(
      s => JSON.parse(s) as { [k: string]: unknown },
    )
  } catch (err) {
    console.error(`getInitialNotifications n=${n} error:`, err)
    return []
  }
}
