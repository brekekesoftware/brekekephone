import './callkeep'

import PushNotificationIOS from '@react-native-community/push-notification-ios'
import { AppState } from 'react-native'
import VoipPushNotification from 'react-native-voip-push-notification'

import parse from './PushNotification-parse'

let voipApnsToken = ''
const onVoipToken = t => {
  if (t) {
    voipApnsToken = t
  }
}

let apnsToken = ''
const onToken = t => {
  if (t) {
    apnsToken = t
  }
}

const onNotification = async (n, initApp) => {
  initApp()
  n = await parse(n)
  if (!n) {
    return
  }
  //
  PushNotificationIOS.getApplicationIconBadgeNumber(badge => {
    badge = (badge || 0) + 1
    if (AppState.currentState === 'active') {
      badge = 0
    }
    if (n.isCall) {
      VoipPushNotification.presentLocalNotification({
        alertBody: n.body,
        alertAction: 'Answer',
        soundName: 'incallmanager_ringtone.mp3',
        applicationIconBadgeNumber: badge,
      })
    } else {
      PushNotificationIOS.presentLocalNotification({
        alertBody: n.body,
        alertAction: 'View',
        applicationIconBadgeNumber: badge,
      })
    }
    PushNotificationIOS.setApplicationIconBadgeNumber(badge)
  })
}

const PushNotification = {
  register: initApp => {
    setTimeout(initApp)
    //
    VoipPushNotification.addEventListener('register', onVoipToken)
    VoipPushNotification.addEventListener('notification', n =>
      onNotification(n, initApp),
    )
    VoipPushNotification.registerVoipToken()
    //
    PushNotificationIOS.addEventListener('register', onToken)
    PushNotificationIOS.addEventListener('notification', n =>
      onNotification(n, initApp),
    )
    PushNotificationIOS.addEventListener('localNotification', n =>
      onNotification(n, initApp),
    )
    //
    PushNotificationIOS.requestPermissions()
    VoipPushNotification.requestPermissions()
  },
  getVoipToken: () => {
    return Promise.resolve(voipApnsToken)
  },
  getToken: () => {
    return Promise.resolve(apnsToken)
  },
  resetBadgeNumber: () => {
    PushNotificationIOS.setApplicationIconBadgeNumber(0)
  },
}

export default PushNotification
