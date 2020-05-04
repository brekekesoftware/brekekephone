import get from 'lodash/get'
import { AppState, Platform } from 'react-native'

import authStore from '../global/authStore'
import callStore from '../global/callStore'

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

const parse = async raw => {
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
  // Skip local notification from ./PushNotification.android.js
  if (
    raw.my_custom_data ||
    raw.is_local_notification ||
    n.my_custom_data ||
    n.is_local_notification
  ) {
    return null
  }
  // Assign more fields to present local message in android/ios specific code
  if (!n.from) {
    const re = /from\s+([^:]+)/
    const matches = re.exec(n.title) || re.exec(n.body)
    n.from = matches?.[1] || ''
  }
  n.isCall = /call/i.test(n.body) || /call/i.test(n.title)
  // Call api to sign in
  const shouldPresentLocal = await authStore.signInByNotification(n)
  if (!shouldPresentLocal) {
    return null
  }
  // PN via callkeep
  if (n.isCall && authStore.currentProfile?.pbxUsername === n.to) {
    return new Promise(resolve => {
      const intervalAt = Date.now()
      const intervalId = setInterval(() => {
        if (Date.now() - intervalAt > 20000) {
          clearInterval(intervalId)
          resolve(AppState.currentState === 'active' ? null : n)
        } else if (callStore._calls.find(c => c.callkeep)) {
          clearInterval(intervalId)
          resolve(null)
        }
      }, 1000)
    })
  }
  //
  return n
}

export default parse
