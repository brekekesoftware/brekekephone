import get from 'lodash/get'
import { AppState, Platform } from 'react-native'
import RNCallKeep from 'react-native-callkeep'

import authStore from '../global/authStore'
import callStore, { uuidFromPN } from '../global/callStore'

const keysInCustomNotification = [
  'title',
  'body',
  'message',
  'from',
  'to',
  'tenant',
  'pbxHostname',
  'pbxPort',
  'my_custom_data',
  'is_local_notification',
]

const _parseNotificationData = (...fields) =>
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
    .reduce((map, f) => {
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
const parseNotificationData = raw => {
  if (Platform.OS === 'android') {
    return _parseNotificationData(
      raw,
      get(raw, 'fcm'),
      get(raw, 'data'),
      get(raw, 'alert'),
      get(raw, 'data.alert'),
      get(raw, 'custom_notification'),
      get(raw, 'data.custom_notification'),
    )
  }
  if (Platform.OS === 'ios') {
    return _parseNotificationData(
      raw,
      get(raw, '_data'),
      get(raw, '_alert'),
      get(raw, '_data.custom_notification'),
    )
  }
  // TODO handle web
  return null
}

const parse = (raw: any, isLocal = false) => {
  if (!raw) {
    return null
  }
  const n = parseNotificationData(raw)
  // Guard for invalid notification
  if (!n.body) {
    n.body = n.message || n.title
  }
  if (!n.body && !n.to) {
    return null
  }

  if (
    isLocal ||
    raw.my_custom_data ||
    raw.is_local_notification ||
    n.my_custom_data ||
    n.is_local_notification
  ) {
    const p = authStore.findProfile({
      ...n,
      pbxUsername: n.to,
      pbxTenant: n.tenant,
    })
    if (authStore.signedInId === p?.id) {
      authStore.reconnect()
    }
    if (p?.id && p.pushNotificationEnabled && !authStore.signedInId) {
      authStore.signIn(p.id)
    }
    return null
  }
  // Assign more fields to present local message in android/ios specific code
  if (!n.from) {
    const re = /from\s+([^:]+)/
    const matches = re.exec(n.title) || re.exec(n.body)
    n.from = matches?.[1] || ''
  }
  n.isCall = /call/i.test(n.body) || /call/i.test(n.title)
  if (!n.isCall) {
    return AppState.currentState !== 'active' ||
      authStore.currentProfile?.pbxUsername !== n.to
      ? n
      : null
  }
  if (
    AppState.currentState !== 'active' &&
    Platform.OS === 'android' &&
    !callStore._calls.length
  ) {
    lastPN = n
    // NativeModules.IncomingCall.showCall(uuidFromPN, n.to, false)
    RNCallKeep.displayIncomingCall(uuidFromPN, 'Brekeke Phone', n.to)
    callStore.recentPNAt = Date.now()
  }
  // Call api to sign in
  authStore.signInByNotification(n)
  return null
}

let lastPN = null
export const getLastPN = () => lastPN

export default parse
