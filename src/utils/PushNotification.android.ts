import './callkeep'

import { isEmpty } from 'lodash'
import { AppRegistry } from 'react-native'
import type {
  Notification,
  Registered,
  RegistrationError,
} from 'react-native-notifications'
import { Notifications } from 'react-native-notifications'

import { chatStore } from '../stores/chatStore'
import { permNotifications } from './permissions'
import { parse } from './PushNotification-parse'
import { BrekekeUtils } from './RnNativeModules'

let fcmTokenFn: Function | undefined = undefined
const fcmToken = new Promise<string>(resolve => {
  fcmTokenFn = resolve
})
const onFcmToken = async (t: string) => {
  if (!fcmTokenFn) {
    const t2 = await fcmToken
    console.log(`PN token debug: onFcmToken already set old=${t2} new=${t}`)
    return
  }
  if (!t) {
    console.error('PN token debug: onFcmToken empty token')
    return
  }
  if (typeof t !== 'string') {
    console.error('PN token debug: onFcmToken not string', t)
    return
  }
  fcmTokenFn?.(t)
  fcmTokenFn = undefined
}

const onNotification = async (
  n0: { [k: string]: unknown },
  initApp: Function,
  isClickAction?: boolean,
) => {
  try {
    await initApp()
    // flush initial notification
    if (!n0?.callkeepUuid) {
      getInitialNotifications().then(ns =>
        ns.forEach(n => onNotification(n, initApp)),
      )
    }
    await parse(n0, false, isClickAction)
  } catch (err) {
    console.error('PushNotification.android.ts onNotification error:', err)
  }
}

export const PushNotification = {
  register: async (initApp: Function) => {
    try {
      await BrekekeUtils.checkPermissionDefaultDialer()
      await permNotifications()
      initApp()
      const hasPermissions: boolean =
        await Notifications.isRegisteredForRemoteNotifications()

      Notifications.registerRemoteNotifications()

      const events = Notifications.events()
      events.registerRemoteNotificationsRegistered((e: Registered) => {
        onFcmToken(e.deviceToken)
      })

      // We should be able to get FCM token without permission request
      if (!hasPermissions) {
        throw new Error("Don't have Permissions")
      }

      events.registerRemoteNotificationsRegistrationFailed(
        (e: RegistrationError) => {
          console.error('Failed to register  remote notification', e)
        },
      )

      // set notification channel for normal case
      Notifications.setNotificationChannel({
        // have to set the default channel: channel_01
        // https://github.com/wix/react-native-notifications/issues/869#issuecomment-1157869452
        channelId: 'channel_01',
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
        vibrationPattern: [200, 1000],
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
        vibrationPattern: [200, 1000],
      })

      // handle received PN
      events.registerNotificationReceivedForeground(
        (n: Notification, completion: Function) => {
          const payload = n.payload?.payload || n.payload
          onNotification(payload, initApp)
        },
      )

      events.registerNotificationOpened(
        (n: Notification, completion: Function, action: any) => {
          const payload = n.payload?.payload || n.payload
          onNotification(payload, initApp, true)
        },
      )

      events.registerNotificationReceivedBackground((n: Notification) => {
        const payload = n.payload?.payload || n.payload
        onNotification(payload, initApp)
      })

      // if the app was launched by a push notification
      // this promise resolves to an object of type Notification
      await Notifications.getInitialNotification().then(n => {
        const payload = n?.payload?.payload || n?.payload
        onNotification(payload, initApp, true)
      })
    } catch (err) {
      console.error(
        'PushNotification register error: Failed to initialize push notification',
        err,
      )
    }
  },

  getToken: () => fcmToken,
  resetBadgeNumber: () => {
    // TODO
  },
}

// TODO
// { callUUID, handle, name }
AppRegistry.registerHeadlessTask(
  'RNCallKeepBackgroundMessage',
  () => () =>
    // https://github.com/react-native-webrtc/react-native-callkeep/blob/master/docs/android-installation.md
    Promise.resolve(undefined),
)

const getInitialNotifications = async () => {
  const n = await BrekekeUtils.getInitialNotifications()
  if (!n) {
    return []
  }
  try {
    const ns = JSON.parse(n) as string[]
    if (isEmpty(ns)) {
      return []
    }
    // handle push local notification for chat message
    ns.forEach(i => {
      const payload = JSON.parse(i) as { [k: string]: string | undefined }
      // check notification type chat message
      if (
        isEmpty(payload) ||
        payload?.event !== 'message' ||
        payload?.title ||
        payload?.body
      ) {
        return
      }
      const senderId = payload?.senderUserId
      const confId = payload?.confId
      chatStore.pushChatNotification(
        '',
        payload?.message || '',
        senderId || confId,
        !senderId,
      )
    })

    return ns.map(s => JSON.parse(s) as { [k: string]: unknown })
  } catch (err) {
    console.error(`getInitialNotifications n=${n} error:`, err)
    return []
  }
}
