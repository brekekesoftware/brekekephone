import './callkeep'

import PushNotificationIOS, {
  PushNotification as PN,
} from '@react-native-community/push-notification-ios'
import { AppState } from 'react-native'
import VoipPushNotification from 'react-native-voip-push-notification'

import parse from './PushNotification-parse'

let voipApnsToken = ''
const onVoipToken = (t: string) => {
  if (t) {
    voipApnsToken = t
  }
}

let apnsToken = ''
const onToken = (t: string) => {
  if (t) {
    apnsToken = t
  }
}

const onNotification = async (
  n0: PN | null,
  initApp: Function,
  isLocal = false,
) => {
  initApp()
  const n: {
    body: string
    isCall: boolean
  } = await parse(n0, isLocal)
  if (!n) {
    return
  }
  //
  PushNotificationIOS.getApplicationIconBadgeNumber(badge => {
    badge = 1 + (Number(badge) || 0)
    if (AppState.currentState === 'active') {
      badge = 0
    }
    VoipPushNotification.presentLocalNotification({
      alertBody: n.body,
      alertAction: n.isCall ? 'Answer' : 'View',
      soundName: n.isCall ? 'incallmanager_ringtone.mp3' : undefined,
      applicationIconBadgeNumber: badge,
    })
    PushNotificationIOS.setApplicationIconBadgeNumber(badge)
  })
}

const PushNotification = {
  register: async (initApp: Function) => {
    window.setTimeout(initApp)
    //
    VoipPushNotification.addEventListener('register', onVoipToken)
    VoipPushNotification.addEventListener('notification', (n: PN) =>
      onNotification(n, initApp),
    )
    VoipPushNotification.registerVoipToken()
    //
    PushNotificationIOS.addEventListener('register', onToken)
    PushNotificationIOS.addEventListener('notification', (n: PN) =>
      onNotification(n, initApp),
    )
    PushNotificationIOS.addEventListener('localNotification', (n: PN) =>
      onNotification(n, initApp, true),
    )
    //
    PushNotificationIOS.requestPermissions()
    VoipPushNotification.requestPermissions()
    //
    const n0 = await PushNotificationIOS.getInitialNotification()
    onNotification(n0, initApp, true)
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
