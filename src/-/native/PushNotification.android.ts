import './callkeep'

import { AppRegistry } from 'react-native'
import FCM, { FCMEvent, Notification as PN } from 'react-native-fcm'

import Alert from '../global/Alert'
import { intlDebug } from '../intl/intl'
import parse from './PushNotification-parse'

const { Notification, RefreshToken } = FCMEvent

let fcmPnToken = ''
const onToken = (t: string) => {
  if (t) {
    fcmPnToken = t
  }
}

const onNotification = (n0: PN, initApp: Function) => {
  try {
    initApp()
    const n: {
      body: string
      isCall: boolean
    } = parse(n0)
    if (!n) {
      return
    }
    //
    FCM.presentLocalNotification({
      body: 'Click to ' + (n.isCall ? 'answer' : 'view'),
      title: n.body,
      sound: n.isCall ? 'incallmanager_ringtone.mp3' : undefined,
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
    console.error(err)
  }
}

const PushNotification = {
  getToken: () => {
    return Promise.resolve(fcmPnToken)
  },
  register: async (initApp: Function) => {
    try {
      initApp()
      await FCM.requestPermissions()
      FCM.enableDirectChannel()
      await FCM.createNotificationChannel({
        id: 'default',
        name: 'Brekeke Phone',
        description: 'Brekeke Phone notification channel',
        priority: 'high',
      })
      FCM.on(RefreshToken, onToken)
      FCM.on(Notification, n => onNotification(n, initApp))
      await FCM.getFCMToken().then(onToken)
      const n = await FCM.getInitialNotification()
      onNotification(n, initApp)
    } catch (err) {
      Alert.error({
        message: intlDebug`Failed to initialize push notification`,
        err,
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
  return Promise.resolve()
})

export default PushNotification
