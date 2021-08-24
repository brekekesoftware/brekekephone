import './callkeep'

import PushNotificationIOS, {
  PushNotification as PN,
} from '@react-native-community/push-notification-ios'
import { AppState } from 'react-native'
import Voip from 'react-native-voip-push-notification'

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
  const withGetData: unknown = n0?.getData ? n0.getData() : n0
  // Custom fork of react-native-voip-push-notification to get callkeepUuid
  const withDictionaryPayload = withGetData as {
    dictionaryPayload: {
      [k: string]: unknown
    }
    callkeepUuid: string
  }
  let withCallkeepUuid = withGetData as {
    [k: string]: unknown
  }
  if (withDictionaryPayload && withDictionaryPayload.dictionaryPayload) {
    withCallkeepUuid = withDictionaryPayload.dictionaryPayload
    withCallkeepUuid.callkeepUuid = withDictionaryPayload.callkeepUuid
  }
  initApp()
  const n = await parse(withCallkeepUuid, isLocal)
  if (!n) {
    return
  }
  //
  PushNotificationIOS.getApplicationIconBadgeNumber(badge => {
    badge = 1 + (Number(badge) || 0)
    if (AppState.currentState === 'active') {
      badge = 0
    }
    PushNotificationIOS.addNotificationRequest({
      id: 'call',
      title: n.body,
      body: n.isCall ? 'Answer' : 'View',
      sound: n.isCall ? 'incallmanager_ringtone.mp3' : undefined,
      badge,
    })
    PushNotificationIOS.setApplicationIconBadgeNumber(badge)
  })
}

const PushNotification = {
  register: async (initApp: Function) => {
    initApp()
    //
    Voip.addEventListener('register', onVoipToken)
    Voip.addEventListener('notification', (n: PN) => onNotification(n, initApp))
    Voip.addEventListener(
      'didLoadWithEvents',
      (e: { name: string; data: PN }[]) => {
        if (!e?.length) {
          return
        }
        e.forEach(({ name, data }) => {
          if (name === Voip.RNVoipPushRemoteNotificationsRegisteredEvent) {
            if (typeof data === 'string') {
              onVoipToken(data)
            }
          } else if (name === Voip.RNVoipPushRemoteNotificationReceivedEvent) {
            onNotification(data, initApp)
          }
        })
      },
    )
    Voip.registerVoipToken()
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
    Voip.requestPermissions()
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
