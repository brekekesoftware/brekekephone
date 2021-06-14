import get from 'lodash/get'
import { AppState, Platform } from 'react-native'
import RNCallKeep from 'react-native-callkeep'
import { v4 as newUuid } from 'react-native-uuid'

import { getAuthStore } from '../stores/authStore'
import waitTimeout from './waitTimeout'

const keysInCustomNotification = [
  'title',
  'alert',
  'body',
  'message',
  'from',
  'to',
  'tenant',
  'pbxHostname',
  'pbxPort',
  'my_custom_data',
  'is_local_notification',
  // Quick login sip
  'phone.id',
  'auth',
  'sip.wss.port',
  'webphone.dtmf.pal',
  'webphone.turn.server',
  'webphone.turn.username',
  'webphone.turn.credential',
  // Others
  'pn-id',
]
// new logic to parse x_ keys
keysInCustomNotification.forEach(k => {
  keysInCustomNotification.push('x_' + k)
})

const parseNotificationDataMultiple = (...fields: object[]): ParsedPn =>
  fields
    .filter(f => !!f)
    .map(f => {
      if (typeof f === 'string') {
        try {
          return JSON.parse(f)
        } catch (err) {}
      }
      return f
    })
    .reduce((map: { [k: string]: unknown }, f: { [k: string]: unknown }) => {
      if (!f || typeof f !== 'object') {
        return map
      }
      keysInCustomNotification.forEach(k => {
        const v = f[k]
        if (!(k in map) && v) {
          map[k] = v
        }
      })
      return map
    }, {})
const parseNotificationData = (raw: object) => {
  if (Platform.OS === 'android') {
    return parseNotificationDataMultiple(
      raw,
      get(raw, 'fcm'),
      get(raw, 'alert'),
      get(raw, 'alert.custom_notification'),
      get(raw, 'data'),
      get(raw, 'data.alert'),
      get(raw, 'data.custom_notification'),
      get(raw, 'custom_notification'),
    )
  }
  if (Platform.OS === 'ios') {
    return parseNotificationDataMultiple(
      raw,
      get(raw, 'custom_notification'),
      get(raw, 'aps'),
      get(raw, 'aps.alert'),
      get(raw, 'aps.custom_notification'),
      get(raw, 'data'),
      get(raw, 'data.custom_notification'),
      get(raw, '_data'),
      get(raw, '_data.custom_notification'),
      get(raw, '_alert'),
      get(raw, '_alert.custom_notification'),
    )
  }
  // TODO handle web
  return null
}

const isNoU = (v: unknown) => v === null || v === undefined
const androidAlreadyProccessedPn: { [k: string]: boolean } = {}

const parse = async (raw: { [k: string]: unknown }, isLocal = false) => {
  if (!raw) {
    return null
  }

  const n = parseNotificationData(raw)
  if (!n) {
    return null
  }

  // new logic to parse x_ keys
  const n2 = n as { [k: string]: unknown }
  Object.entries(n).forEach(([k, v]) => {
    if (!k.startsWith('x_') || isNoU(v)) {
      return
    }
    const k2 = k.substr(2)
    // if (!isNoU(n2[k2])) {
    //   return
    // }
    n2[k2] = v
  })

  if (!n.body) {
    n.body = n.message || n.title || n.alert
  }
  if (!n.body && !n.to) {
    return null
  }

  const pnId: string = get(n, 'pn-id')
  if (Platform.OS === 'android' && pnId && androidAlreadyProccessedPn[pnId]) {
    return
  }
  androidAlreadyProccessedPn[pnId] = true

  const phoneId: string = get(n, 'phone.id')
  const sipAuth: string = get(n, 'auth')
  const sipWssPort: string = get(n, 'sip.wss.port')
  const dtmfPal: string = get(n, 'webphone.dtmf.pal')
  const turnServer: string = get(n, 'webphone.turn.server')
  const turnUsername: string = get(n, 'webphone.turn.username')
  const turnCredential: string = get(n, 'webphone.turn.credential')
  n.sipPn = {
    phoneId,
    sipAuth,
    sipWssPort,
    dtmfPal,
    turnServer,
    turnUsername,
    turnCredential,
  }

  if (
    isLocal ||
    raw['my_custom_data'] ||
    raw['is_local_notification'] ||
    n.my_custom_data ||
    n.is_local_notification
  ) {
    const p = getAuthStore().findProfile({
      ...n,
      pbxUsername: n.to,
      pbxTenant: n.tenant,
    })
    if (getAuthStore().signedInId === p?.id) {
      getAuthStore().reconnect()
    }
    if (p?.id && !getAuthStore().signedInId) {
      getAuthStore().signIn(p.id)
    }
    return null
  }
  const re = /from\s+(.+)\s+to\s+(\S+)/
  const matches = re.exec(n.title) || re.exec(n.body)
  if (!n.from) {
    n.from = matches?.[1] || ''
  }
  if (!n.to) {
    n.to = matches?.[2] || ''
  }
  n.isCall = /call/i.test(n.body) || /call/i.test(n.title)
  if (!n.isCall) {
    return AppState.currentState !== 'active' ||
      getAuthStore().currentProfile?.pbxUsername !== n.to
      ? n
      : null
  }
  lastCallPnData = n
  if (Platform.OS === 'android') {
    RNCallKeep.endAllCalls()
    const uuid = newUuid().toUpperCase()
    callPnDataMap[uuid] = n
    RNCallKeep.displayIncomingCall(uuid, 'Brekeke Phone', n.to)
  }
  // Call api to sign in
  getAuthStore().signInByNotification(n)
  await waitTimeout(3000)
  return null
}

export type ParsedPn = {
  title: string
  body: string
  alert: string
  message: string
  from: string
  to: string
  tenant: string
  pbxHostname: string
  pbxPort: string
  my_custom_data: unknown
  is_local_notification: boolean
  isCall: boolean
  sipPn: SipPn
}
export type SipPn = {
  phoneId: string
  sipAuth: string
  sipWssPort: string
  dtmfPal: string
  turnServer: string
  turnUsername: string
  turnCredential: string
}

let callPnDataMap: { [k: string]: ParsedPn } = {}
export const deleteCallPnData = (uuid: string) => {
  delete callPnDataMap[uuid]
}

let lastCallPnData: ParsedPn | undefined = undefined
export const getCallPnData = (uuid?: string) =>
  (uuid && callPnDataMap[uuid]) || lastCallPnData

export default parse
