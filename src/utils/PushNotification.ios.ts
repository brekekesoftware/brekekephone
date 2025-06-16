import './callkeep'

import type { PushNotification as PN } from '@react-native-community/push-notification-ios'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import Voip from 'react-native-voip-push-notification'

import { parse } from './PushNotification-parse'

let voipTokenFn: Function | undefined = undefined
const voipToken = new Promise<string>(resolve => {
  voipTokenFn = resolve
})
const onVoipToken = async (t: string) => {
  if (!voipTokenFn) {
    const t2 = await voipToken
    console.log(`PN token debug: onVoipToken already set old=${t2} new=${t}`)
    return
  }
  if (!t) {
    console.error('PN token debug: onVoipToken empty token')
    return
  }
  if (typeof t !== 'string') {
    console.error('PN token debug: onVoipToken not string', t)
    return
  }
  voipTokenFn?.(t)
  voipTokenFn = undefined
}

let apnsTokenFn: Function | undefined = undefined
const apnsToken = new Promise<string>(resolve => {
  apnsTokenFn = resolve
})
const onApnsToken = async (t: string) => {
  if (!apnsTokenFn) {
    const t2 = await apnsToken
    console.log(`PN token debug: onApnsToken already set old=${t2} new=${t}`)
    return
  }
  if (!t) {
    console.error('PN token debug: onApnsToken empty token')
    return
  }
  if (typeof t !== 'string') {
    console.error('PN token debug: onApnsToken not string', t)
    return
  }
  apnsTokenFn?.(t)
  apnsTokenFn = undefined
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
  await parse(withCallKeepUuid, isLocal, isLocal)
}

export const PushNotification = {
  register: async (initApp: Function) => {
    initApp()

    Voip.addEventListener('register', onVoipToken)
    Voip.addEventListener('notification', ((n: any) =>
      onNotification(n as PN, initApp)) as any)
    Voip.addEventListener('didLoadWithEvents', ((
      e: { name: string; data: PN }[],
    ) => {
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
    }) as any)
    Voip.registerVoipToken()

    PushNotificationIOS.addEventListener('register', onApnsToken)
    PushNotificationIOS.addEventListener('notification', (n: PN) =>
      onNotification(n, initApp),
    )
    PushNotificationIOS.addEventListener('localNotification', (n: PN) =>
      onNotification(n, initApp, true),
    )
    PushNotificationIOS.requestPermissions()

    const n0 = await PushNotificationIOS.getInitialNotification()
    onNotification(n0, initApp, true)
  },

  getToken: () => apnsToken,
  getVoipToken: () => voipToken,
  resetBadgeNumber: () => {
    PushNotificationIOS.setApplicationIconBadgeNumber(0)
  },
}
