import jsonStableStringify from 'json-stable-stringify'
import get from 'lodash/get'
import { AppState, Platform } from 'react-native'

import { getAuthStore } from '../stores/authStore'
import { callStore } from '../stores/callStore'
import { Nav } from '../stores/Nav'
import { BrekekeUtils } from './RnNativeModules'
import { waitTimeout } from './waitTimeout'

const keysInCustomNotification = [
  'title',
  'threadId',
  'alert',
  'body',
  'message',
  'from',
  'image',
  'image_size',
  'displayname',
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
  'webphone.dtmf.send.pal',
  'webphone.turn.server',
  'webphone.turn.username',
  'webphone.turn.credential',
  // Others
  'pn-id',
  'callkeepUuid',
  'callkeepAt',
]
// new logic to parse x_ keys
keysInCustomNotification.forEach(k => {
  keysInCustomNotification.push('x_' + k)
})

const parseNotificationDataMultiple = (...fields: object[]): ParsedPn => {
  let imageUrl = ''
  let imageSize

  const parsedPN = fields
    .filter(f => !!f)
    .map(f => {
      // @ts-ignore
      if (typeof f === 'string' && f.charAt(0) === '{') {
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
        if (
          k === 'x_image' &&
          f[k] &&
          typeof f[k] === 'string' &&
          `${f[k]}`.length > 0
        ) {
          imageUrl = `${f[k]}`
        }

        if (
          k === 'x_image_size' &&
          f[k] &&
          typeof f[k] === 'string' &&
          `${f[k]}`.length > 0
        ) {
          imageSize = `${f[k]}`
        }
      })
      return map
    }, {})

  if (imageUrl.length > 0) {
    callStore.updateCallAvatar(imageUrl, imageSize)
  }

  return parsedPN
}

export const parseNotificationData = (raw: object) => {
  let n: ParsedPn | undefined
  if (Platform.OS === 'android') {
    n = parseNotificationDataMultiple(
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
    n = parseNotificationDataMultiple(
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
  if (!n) {
    return
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
  n.id = get(n, 'pn-id')

  const phoneId: string = get(n, 'phone.id')
  const sipAuth: string = get(n, 'auth')
  const sipWssPort: string = get(n, 'sip.wss.port')
  const dtmfSendPal: string = get(n, 'webphone.dtmf.send.pal')
  const turnServer: string = get(n, 'webphone.turn.server')
  const turnUsername: string = get(n, 'webphone.turn.username')
  const turnCredential: string = get(n, 'webphone.turn.credential')
  n.sipPn = {
    phoneId,
    sipAuth,
    sipWssPort,
    dtmfSendPal,
    turnServer,
    turnUsername,
    turnCredential,
  }

  if (!n.body) {
    n.body = n.message || n.title || n.alert
  }
  if (!n.body) {
    return
  }

  const r1 = /from\s+(.+)\s+to\s+(\S+)/i
  const matches =
    r1.exec(n.body) ||
    r1.exec(n.title) ||
    r1.exec(n.message) ||
    r1.exec(n.alert)
  if (!n.from) {
    n.from = matches?.[1] || ''
  }
  if (!n.to) {
    n.to = matches?.[2] || ''
  }
  n.displayName = get(n, 'displayname') || n.from

  n.isCall = !!n.id || !!n.sipPn.sipAuth

  return n
}

const isNoU = (v: unknown) => v === null || v === undefined
const androidAlreadyProccessedPn: { [k: string]: boolean } = {}

export const signInByLocalNotification = (n: ParsedPn) => {
  const p = getAuthStore().findProfile({
    ...n,
    pbxUsername: n.to,
    pbxTenant: n.tenant,
  })
  if (getAuthStore().signedInId === p?.id) {
    getAuthStore().resetFailureState()
  }
  if (p?.id && !getAuthStore().signedInId) {
    getAuthStore().signIn(p.id)
  }
}
export const parse = async (raw: { [k: string]: unknown }, isLocal = false) => {
  if (!raw) {
    return null
  }

  const rawId = raw['id'] as string | undefined
  if (rawId?.startsWith('missedcall')) {
    // Nav after signin in App.tsx mobx observe?
    Nav().customPageIndex = Nav().goToPageCallRecents
    waitTimeout().then(Nav().goToPageCallRecents)
  }

  const n = parseNotificationData(raw)
  if (!n) {
    return null
  }

  isLocal = Boolean(
    isLocal ||
      raw.my_custom_data ||
      raw.is_local_notification ||
      n.my_custom_data ||
      n.is_local_notification,
  )

  if (Platform.OS === 'android') {
    if (n.id) {
      if (androidAlreadyProccessedPn[n.id]) {
        console.error(
          `SIP PN debug: PushNotification-parse: already processed pnId=${n.id}`,
        )
        return null
      }
      androidAlreadyProccessedPn[n.id] = true
    } else {
      // handle duplicated pn
      const s = jsonStableStringify(n)
      if (androidAlreadyProccessedPn[s]) {
        return
      }
      androidAlreadyProccessedPn[s] = true
    }
  }

  if (n.callkeepAt) {
    console.error(
      `SIP PN debug: PN received on android java code at ${n.callkeepAt}`,
    )
  }
  if (isLocal) {
    signInByLocalNotification(n)
    if (!rawId?.startsWith('missedcall')) {
      const nav = Nav()
      if (n.threadId && n.threadId.length > 0) {
        nav.customPageIndex = nav.goToPageChatDetail
        waitTimeout().then(() => nav.goToPageChatDetail({ buddy: n.threadId }))
      } else {
        nav.customPageIndex = nav.goToPageChatRecents
        waitTimeout().then(nav.goToPageChatRecents)
      }
    }
    console.error('SIP PN debug: PushNotification-parse: local notification')
    return null
  }
  if (!n.isCall) {
    console.error('SIP PN debug: PushNotification-parse: n.isCall=false')
    return AppState.currentState !== 'active' ||
      getAuthStore().currentProfile?.pbxUsername !== n.to
      ? n
      : null
  }
  console.error('SIP PN debug: call signInByNotification')
  getAuthStore().signInByNotification(n)
  // Custom fork of react-native-voip-push-notification to get callkeepUuid
  // Also we forked fcm to insert callkeepUuid there as well
  if (!n.callkeepUuid) {
    // Should not happen
    console.error(
      `SIP PN debug: PushNotification-parse got pnId=${n.id} without callkeepUuid`,
    )
  }
  callStore.calls
    .filter(c => c.pnId === n.id && !c.callkeepUuid)
    .forEach(c => {
      Object.assign(c, { callkeepUuid: n.callkeepUuid })
    })
  // Continue handling incoming call in android
  if (Platform.OS === 'android') {
    callStore.showIncomingCallUi({ callUUID: n.callkeepUuid, pnData: n })
    const action = await BrekekeUtils.getIncomingCallPendingUserAction(
      n.callkeepUuid,
    )
    console.error(`SIP PN debug: getPendingUserAction=${action}`)
    if (action === 'answerCall') {
      callStore.onCallKeepAnswerCall(n.callkeepUuid)
    } else if (action === 'rejectCall') {
      callStore.onCallKeepEndCall(n.callkeepUuid)
    }
    // Already invoke callkeep in java code
  }
  // Let pbx/sip connect by this awaiting time
  await waitTimeout(10000)
  return null
}

export type ParsedPn = {
  id: string
  title: string
  body: string
  threadId: string
  alert: string
  message: string
  from: string
  displayName: string
  to: string
  tenant: string
  pbxHostname: string
  pbxPort: string
  my_custom_data: unknown
  is_local_notification: boolean
  isCall: boolean
  sipPn: SipPn
  callkeepUuid: string
  callkeepAt: string
}
export type SipPn = {
  phoneId: string
  sipAuth: string
  sipWssPort: string
  dtmfSendPal: string
  turnServer: string
  turnUsername: string
  turnCredential: string
}

export const toXPN = (n: object) =>
  Object.entries(n).reduce((m, [k, v]) => {
    m['x_' + k] = v
    return m
  }, {} as { [k: string]: unknown })
