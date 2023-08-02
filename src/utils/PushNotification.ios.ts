import './callkeep'

import PushNotificationIOS, {
  PushNotification as PN,
} from '@react-native-community/push-notification-ios'
import Voip from 'react-native-voip-push-notification'

import { parse } from './PushNotification-parse'

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
  const withGetData: unknown = n0?.getData?.() || n0
  // custom fork of react-native-voip-push-notification to get callkeepUuid
  type Payload = {
    dictionaryPayload: {
      [k: string]: unknown
    }
    callkeepUuid: string
  }
  const withDictionaryPayload = withGetData as Payload | undefined
  let withCallKeepUuid = withGetData as { [k: string]: unknown } | undefined
  if (withDictionaryPayload?.dictionaryPayload) {
    withCallKeepUuid = withDictionaryPayload.dictionaryPayload
    withCallKeepUuid.callkeepUuid = withDictionaryPayload.callkeepUuid
  }
  await initApp()
  const n = await parse(withCallKeepUuid, isLocal)
  if (!n) {
    return
  }
  // TODO ios present local PN?
  // modify server to set background mode "content only"?
  // toXPN
}

export const PushNotification = {
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
          if (name === 'RNVoipPushRemoteNotificationsRegisteredEvent') {
            if (typeof data === 'string') {
              onVoipToken(data)
            }
          } else if (name === 'RNVoipPushRemoteNotificationReceivedEvent') {
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
