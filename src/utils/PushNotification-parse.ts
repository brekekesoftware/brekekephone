import { AppState } from 'react-native'

import { isAndroid, isIos } from '#/config'
import { ctx } from '#/stores/ctx'
import { BrekekeUtils } from '#/utils/BrekekeUtils'
import { openLinkSafely, urls } from '#/utils/deeplink'
import { jsonStable } from '#/utils/jsonStable'
import { get } from '#/utils/lodash'
import { PushNotification } from '#/utils/PushNotification'
import { toBoolean } from '#/utils/string'
import { waitTimeout } from '#/utils/waitTimeout'

const keysInCustomNotification = [
  'google.message_id',
  'title',
  'threadId',
  'isGroupChat',
  'senderUserId',
  'confId',
  'senderUserName',
  'alert',
  'body',
  'message',
  'from',
  'image',
  'image_size',
  'displayname',
  'to',
  'tenant',
  'host',
  'pbxHostname',
  'pbxPort',
  'my_custom_data',
  'is_local_notification',
  // quick login sip
  'phone.id',
  'auth',
  'sip.wss.port',
  'webphone.dtmf.send.pal',
  'webphone.turn.server',
  'webphone.turn.username',
  'webphone.turn.credential',
  'autoanswer',
  // others
  'pn-id',
  'callkeepUuid',
  'callkeepAt',
  'time',
]
// new logic to parse x_ keys
keysInCustomNotification.forEach(k => {
  keysInCustomNotification.push(`x_${k}`)
})

const parseNotificationDataMultiple = (...fields: object[]): ParsedPn => {
  const n: ParsedPn = fields
    .filter(f => f)
    .map(f => {
      // @ts-ignore
      if (typeof f === 'string' && f.charAt(0) === '{') {
        try {
          return JSON.parse(f)
        } catch (err) {}
      }
      return f
    })
    .reduce((map: { [k: string]: string }, f: { [k: string]: string }) => {
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
  if (n.image) {
    ctx.call.updateCallAvatar(n)
  }
  return n
}

export const parseNotificationData = (raw?: object) => {
  if (!raw) {
    return
  }

  let n: ParsedPn | undefined
  if (isAndroid) {
    n = parseNotificationDataMultiple(
      raw,
      get(raw, 'alert'),
      get(raw, 'alert.custom_notification'),
      get(raw, 'data'),
      get(raw, 'data.alert'),
      get(raw, 'data.custom_notification'),
      get(raw, 'custom_notification'),
    )
  }
  if (isIos) {
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
    n2[k2] = v
  })

  n.id = get(n, 'pn-id')
  n.pbxHostname = n.pbxHostname || get(n, 'host')

  const phoneId: string = get(n, 'phone.id')
  const sipAuth: string = get(n, 'auth')
  const sipWssPort: string = get(n, 'sip.wss.port')
  const dtmfSendPal: string = get(n, 'webphone.dtmf.send.pal')
  const turnServer: string = get(n, 'webphone.turn.server')
  const turnUsername: string = get(n, 'webphone.turn.username')
  const turnCredential: string = get(n, 'webphone.turn.credential')
  const autoAnswer = toBoolean(get(n, 'autoanswer'))
  n.sipPn = {
    phoneId,
    sipAuth,
    sipAuthAt: Date.now(),
    sipWssPort,
    dtmfSendPal,
    turnServer,
    turnUsername,
    turnCredential,
    autoAnswer,
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

  n.isCall = !!(n.id || n.sipPn.sipAuth)
  n.time = Number(n.time) || 0

  return n
}

const isNoU = (v: unknown) => v === null || v === undefined
let androidAlreadyProccessedPn: { [k: string]: boolean } = {}

// after pbx server reset, call id (number) on the server side will be reset to 1, 2, 3...
// if the cache contain those ids previously, the new calls will be rejected
export const resetProcessedPn = () => {
  ctx.call.callkeepActionMap = {}
  androidAlreadyProccessedPn = {}
}

export const parse = async (
  raw?: { [k: string]: unknown },
  isLocal = false,
  isClickAction = false,
) => {
  const n = parseNotificationData(raw)

  if (!raw || !n) {
    return
  }
  // received PN chat but don't click item notification
  if (!n.isCall && !isClickAction) {
    return
  }

  // handle duplicated pn on android
  // sometimes getInitialNotifications not update callkeepUuid yet or Event NotificationOpened triggered get more than once
  if (isAndroid) {
    const k = n.id || jsonStable(raw)
    if (androidAlreadyProccessedPn[k]) {
      console.log(
        `SIP PN debug: PushNotification-parse: already processed k=${k}`,
      )
      return
    }
    androidAlreadyProccessedPn[k] = true
  }

  const acc = await ctx.sip.checkAndRemovePnTokenViaSip(n)
  if (!acc) {
    console.log(
      'checkAndRemovePnTokenViaSip debug: do not show pn account not exist',
    )
    return
  }

  console.log('SIP PN debug: call signInByNotification')
  await ctx.auth.signInByNotification(n)

  const navIndex = async (k: keyof typeof ctx.nav, params?: any) => {
    ctx.nav.customPageIndex = ctx.nav[k]
    await waitTimeout()
    ctx.nav[k]?.(params)
  }

  const rawId = raw['id'] as string | undefined
  // handle missed call local notification
  if (rawId?.startsWith('missedcall')) {
    console.log(
      'SIP PN debug: PushNotification-parse: local notification missed call',
    )

    if (ctx.auth.userExtensionProperties && ctx.auth.phoneappliEnabled()) {
      navIndex('goToPageCallKeypad')
      if (isIos) {
        PushNotification.resetBadgeNumber()
      }
      openLinkSafely(urls.phoneappli.HISTORY_CALLED)
    } else {
      navIndex('goToPageCallRecents')
    }
    return
  }

  const isChatMessage = Boolean(
    isLocal ||
      raw.my_custom_data ||
      raw.is_local_notification ||
      n.my_custom_data ||
      n.is_local_notification ||
      !n.isCall,
  )
  // handle uc chat notification on press
  // currently server is sending PN as not-data-only
  // if the app is killed, the PN will show up instantly without triggering this code
  if (isChatMessage) {
    const appState = AppState.currentState
    const senderId = n?.senderUserId || n.threadId
    const confId = n?.confId || n.threadId
    const isGroupChat = n.isGroupChat
    console.log(
      `SIP PN debug: PushNotification-parse: isChatMessage=true appState=${appState} senderId=${senderId} confId=${confId} isGroupChat=${isGroupChat}`,
    )
    if (!acc.ucEnabled) {
      return
    }
    if (!senderId && !confId) {
      navIndex('goToPageChatRecents')
      return
    }
    if ((isGroupChat || !senderId) && confId) {
      ctx.nav.customPageIndex = ctx.nav.goToPageChatRecents
      waitTimeout().then(() => ctx.chat.handleMoveToChatGroupDetail(confId))
      return
    }
    if (senderId) {
      ctx.nav.customPageIndex = ctx.nav.goToPageChatRecents
      waitTimeout().then(() => ctx.nav.goToPageChatDetail({ buddy: senderId }))
      return
    }
    return
  }

  // handle call notification
  if (n.callkeepAt) {
    console.log(
      `SIP PN debug: PN received on android java code at ${n.callkeepAt}`,
    )
    ctx.auth.saveActionOpenCustomPage = true
  }

  // custom fork of react-native-voip-push-notification to get callkeepUuid
  // also we forked fcm to insert callkeepUuid there as well
  // then this should not happen
  if (!n.callkeepUuid) {
    console.error(
      `SIP PN debug: PushNotification-parse got pnId=${n.id} without callkeepUuid`,
    )
    return
  }

  ctx.call.calls
    .filter(c => c.pnId === n.id && !c.callkeepUuid)
    .forEach(c => {
      Object.assign(c, { callkeepUuid: n.callkeepUuid })
    })

  // continue handling incoming call in android
  if (isAndroid) {
    ctx.call.showIncomingCallUi({ callUUID: n.callkeepUuid, pnData: n })
    const action = await BrekekeUtils.getIncomingCallPendingUserAction(
      n.callkeepUuid,
    )
    console.log(`SIP PN debug: getPendingUserAction=${action}`)
    if (action === 'answerCall') {
      ctx.call.onCallKeepAnswerCall(n.callkeepUuid)
      // call with auto-answer before PN arrive
      if (n.sipPn.autoAnswer) {
        BrekekeUtils.onCallConnected(n.callkeepUuid)
      }
    } else if (action === 'rejectCall') {
      ctx.call.onCallKeepEndCall(n.callkeepUuid)
    }
    // already invoke callkeep in java code
  }
  // let pbx/sip connect by this awaiting time
  await waitTimeout(10000)
  return
}

export type ParsedPn = {
  message_id: string
  confId: string
  senderUserId: string
  id: string
  title: string
  body: string
  threadId: string
  isGroupChat?: boolean
  alert: string
  message: string
  from: string
  image: string
  image_size: string
  displayName: string
  to: string
  tenant: string
  pbxHostname?: string
  pbxPort?: string
  my_custom_data: unknown
  is_local_notification: boolean
  isCall: boolean
  sipPn: SipPn
  callkeepUuid: string
  callkeepAt: string
  time: number
}
export type SipPn = {
  phoneId: string
  sipAuth: string
  sipAuthAt: number
  sipWssPort: string
  dtmfSendPal: string
  turnServer: string
  turnUsername: string
  turnCredential: string
  autoAnswer: boolean
}
