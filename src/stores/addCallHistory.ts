import PushNotificationIOS from '@react-native-community/push-notification-ios'
import moment from 'moment'
import { AppState } from 'react-native'
import { Notifications } from 'react-native-notifications'
import { v4 as newUuid } from 'uuid'

import { isAndroid, isIos } from '#/config'
import { embedApi } from '#/embed/embedApi'
import { isEmbed } from '#/embed/polyfill'
import { Call } from '#/stores/Call'
import {
  getPbxName,
  getPbxNameWithUpdateContact,
  getPhoneappliName,
} from '#/stores/contactStore'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { BrekekeUtils, CallLogType } from '#/utils/BrekekeUtils'
import { jsonStable } from '#/utils/jsonStable'
import { permForCallLog } from '#/utils/permissions'
import type { ParsedPn } from '#/utils/PushNotification-parse'
import { waitTimeout } from '#/utils/waitTimeout'
import { webShowNotification } from '#/utils/webShowNotification'

let alreadyAddHistoryMap: { [pnId: string]: true } = {}

const parseReasonCancelCall = (reason?: string) => {
  if (!reason) {
    return
  }
  const m = reason.match(/"([^"]+)"/i)
  if (!m) {
    return
  }
  return m[1]
}

type UserInfo = {
  unknown?: boolean
  name?: string
  phoneNumber?: string
}
const getUserInfoFromReasons = (
  reason?: string | false,
): UserInfo | undefined => {
  if (!reason) {
    return
  }
  if (reason.match(/call completed elsewhere/i)) {
    return {
      unknown: true,
    }
  }
  // when *** has ( and ),  the string in those parentheses is the phone number.
  // when *** does not have ( and ), then the entiere string is the phone number.
  let m = reason.match(/call completed by (.*?)\((.*?)\)/i)
  if (!m) {
    m = reason.match(/call completed by (.+)/i)
  }
  if (!m) {
    return
  }
  return {
    name: m[2] ? m[1].trim() : '',
    phoneNumber: m[2] ? m[2].trim() : m[1].trim(),
  }
}
const getReasonCancelCall = async (ms?: UserInfo) => {
  if (!ms) {
    return
  }
  if (ms.unknown) {
    return intl`answered by someone else`
  }
  let name = ms.name
  if (!name && ms.phoneNumber) {
    name = (await getPbxNameWithUpdateContact(ms.phoneNumber)) || ms.phoneNumber
  }
  return intl`answered by ${name}`
}

export const addCallHistory = async (
  c: Call | ParsedPn,
  completedBy?: string,
) => {
  const isTypeCall = c instanceof Call || 'partyNumber' in c

  if (isTypeCall && c.partyNumber === '8') {
    // voice mail
    return
  }

  const pnId = (isTypeCall ? c.pnId : c.id) || c.id || jsonStable(c)
  if (pnId) {
    if (alreadyAddHistoryMap[pnId]) {
      return
    }
    alreadyAddHistoryMap[pnId] = true
  }

  if (!isTypeCall && !(await ctx.account.findByPn(c))) {
    console.log(
      'checkAndRemovePnTokenViaSip debug: do not add history account not exist',
    )
    return
  }

  if (ctx.auth.pbxLoginFromAnotherPlace) {
    console.log(
      'pbxLoginFromAnotherPlace debug: dispose authSIP and authPBX after call finished',
    )
    ctx.authSIP.dispose()
    ctx.authPBX.dispose()
    ctx.auth.showMsgPbxLoginFromAnotherPlace = true
  }

  const ms =
    isTypeCall &&
    parseReasonCancelCall(c?.rawSession?.incomingMessage?.getHeader('Reason'))

  // don't save and show pn with cancel header include 'call completed elsewhere'
  if (ms && ms.toLowerCase().includes('call completed elsewhere')) {
    return
  }
  const id = newUuid()
  const created = moment().format('HH:mm - MMM D')
  const answeredBy = getUserInfoFromReasons(isTypeCall ? ms : completedBy)
  const reason = await getReasonCancelCall(answeredBy)
  const line = (isTypeCall && c?.line) || undefined
  // with incoming: If the string includes /, you store only aaa to the log and ignore / and the following string.
  const isIncoming = isTypeCall && c.incoming
  const lineValue = isIncoming
    ? line?.split('/')?.[0]?.trim() || line?.trim() || undefined
    : line?.trim() || undefined
  const lineLabel = lineValue
    ? ctx.auth.resourceLines?.find(item => item.value === lineValue)?.key
    : undefined

  const info = isTypeCall
    ? {
        id,
        created,
        incoming: c.incoming,
        answered: c.answered,
        partyName: await c.getDisplayNameAsync(),
        partyNumber: c.partyNumber,
        duration: c.getDuration(),
        isAboutToHangup: c.isAboutToHangup,
        reason,
        answeredBy,
        lineValue,
        lineLabel,
        to: c.pbxUsername,
      }
    : {
        id,
        created,
        incoming: true,
        answered: false,
        partyName:
          getPbxName({ partyNumber: c.from, preferPbxName: true }) ||
          c.displayName ||
          c.from,
        partyNumber: c.from,
        duration: 0,
        reason,
        answeredBy,
        // TODO: B killed app, A call B, B reject quickly, then A cancel quickly
        // -> B got cancel event from sip
        isAboutToHangup: false,
        to: c.to,
      }

  // do not show notification if rejected by callee
  const m = ctx.call.calleeRejectedMap
  const calleeRejected = m[c.callkeepUuid] || m[pnId]

  if (!calleeRejected) {
    presentNotification(info)
  }

  // try to wait for login?
  // TODO:
  // add method based on the Account class
  // allow multiple accounts at the same time

  const current = ctx.auth.getCurrentAccount()
  if (!current) {
    await waitTimeout()
  }
  if (!ctx.auth.getCurrentAccount()) {
    return
  }
  if (ctx.auth.phoneappliEnabled()) {
    return
  }
  ctx.auth.pushRecentCall(info)
  if (isAndroid) {
    addToCallLog(info)
  }
}

export type CallHistoryInfo = {
  id: string
  created: string
  incoming: boolean
  answered: boolean
  partyName: string
  partyNumber: string
  duration: number
  isAboutToHangup: boolean
  reason?: string
  answeredBy?: UserInfo
  lineLabel?: string
  lineValue?: string
  to?: string
}

// Need to clear alreadyAddHistoryMap when pbx stops to avoid losing history log
export const clearAlreadyHistoryMap = () => {
  alreadyAddHistoryMap = {}
}

const addToCallLog = async (c: CallHistoryInfo) => {
  // TODO: temporary disabled
  const disabled = true
  if (disabled) {
    return
  }
  if (!(await permForCallLog())) {
    return
  }
  const { incoming, answered, partyName, partyNumber } = c
  if (!partyNumber || !partyName) {
    return
  }
  const type =
    incoming && !answered
      ? CallLogType.MISSED_TYPE
      : incoming && answered
        ? CallLogType.INCOMING_TYPE
        : CallLogType.OUTGOING_TYPE
  BrekekeUtils.insertCallLog(partyNumber || partyName, type)
}

const getBodyForNotification = async (c: CallHistoryInfo) => {
  if (!c.answeredBy) {
    return c.partyName || c.partyNumber
  }

  const from = c.partyName || c.partyNumber
  const { unknown, name, phoneNumber } = c.answeredBy
  const r = intl`The call from ${from} is answered by someone else`

  if (unknown) {
    return r
  }
  if (!phoneNumber) {
    // should not happen, just for type safety
    return r
  }

  const contactName =
    (ctx.auth.phoneappliEnabled()
      ? await getPhoneappliName(phoneNumber)
      : await getPbxNameWithUpdateContact(phoneNumber)) ||
    name ||
    phoneNumber
  return intl`The call from ${from} is answered by ${contactName}`
}

const presentNotification = async (c: CallHistoryInfo) => {
  const title = intl`Missed call`
  const body = await getBodyForNotification(c)

  // show notification call completed elsewhere in web embed api
  const ccew = embedApi._notificationOptions?.notificationCallCompletedElseWhere
  if (
    isEmbed &&
    c.answeredBy &&
    (ccew === true || (typeof ccew === 'function' && ccew(c)))
  ) {
    webShowNotification({
      type: 'call',
      id: c.id,
      body,
      tag: title,
      title,
      interval:
        embedApi._notificationOptions
          ?.notificationCallCompletedElseWhereInterval,
    })
    return
  }

  // legacy non-embed logic
  const shouldPresent = c.answered && c.answeredBy
  if ((c.answered || !c.incoming || c.isAboutToHangup) && !shouldPresent) {
    return
  }

  if (isAndroid) {
    Notifications.postLocalNotification({
      payload: {
        title,
        body,
        number: 0,
        priority: 'high',
        show_in_foreground: true,
        local_notification: true,
        wake_screen: false,
        ongoing: false,
        lights: true,
        channel: 'default',
        icon: 'ic_launcher',
        id: `missedcall-${Date.now()}`,
        pre_app_state: AppState.currentState,
        my_custom_data: 'local_notification',
        is_local_notification: 'local_notification',
        to: c.to,
      },
      identifier: new Date().toISOString(),
      body,
      title,
      sound: '',
      badge: 0,
      type: '',
      thread: '',
    })
    return
  }

  if (isIos) {
    PushNotificationIOS.getApplicationIconBadgeNumber(badge => {
      badge = 1 + (Number(badge) || 0)
      PushNotificationIOS.addNotificationRequest({
        id: `missedcall-${Date.now()}`,
        title,
        body,
        sound: undefined,
        badge,
        userInfo: {
          id: `missedcall-${Date.now()}`,
          aps: {
            title,
            body,
            my_custom_data: 'local_notification',
            pre_app_state: AppState.currentState,
            local_notification: true,
            is_local_notification: 'local_notification',
            to: c.to,
          },
        },
      })
      PushNotificationIOS.setApplicationIconBadgeNumber(badge)
    })
  }
}
