import './callkeep'

import { AppRegistry } from 'react-native'
import FCM, { FCMEvent, Notification } from 'react-native-fcm'

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

const onNotification = async (n0: Notification, initApp: Function) => {
  try {
    await initApp()
    // flush initial notification
    getInitialNotifications().then(ns =>
      ns.forEach(n => onNotification(n, initApp)),
    )
    const n = await parse(n0)
    if (!n) {
      return
    }

    //
    FCM.presentLocalNotification({
      ...n,
      body: 'Click to view',
      title: n.body,
      number: 0,
      priority: 'high',
      show_in_foreground: true,
      local_notification: true,
      wake_screen: true,
      ongoing: false,
      lights: true,
      channel: 'default',
      icon: 'ic_launcher',
      my_custom_data: 'local_notification',
      is_local_notification: 'local_notification',
    })
  } catch (err) {
    console.error(`PushNotification.android.ts onNotification err: ${err}`)
  }
}

export const PushNotification = {
  getToken: () => {
    return Promise.resolve(fcmPnToken)
  },
  register: async (initApp: Function) => {
    try {
      initApp()
      await FCM.requestPermissions()
      await FCM.createNotificationChannel({
        id: 'default',
        name: 'Brekeke Phone',
        description: 'Brekeke Phone notification channel',
        priority: 'high',
      })
      FCM.on(FCMEvent.RefreshToken, onToken)
      FCM.on(FCMEvent.Notification, (n: Notification) =>
        onNotification(n, initApp),
      )
      await FCM.getFCMToken().then(onToken)
      await getInitialNotifications().then(ns =>
        ns.forEach(n => onNotification(n, initApp)),
      )
      // killed state local PN interaction?
      await FCM.getInitialNotification().then(n => onNotification(n, initApp))
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
    return (JSON.parse(n) as string[]).map(s => JSON.parse(s) as Notification)
  } catch (err) {
    console.error(`getInitialNotifications n=${n} err: ${err}`)
    return []
  }
}
