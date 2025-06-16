import PushNotificationIOS from '@react-native-community/push-notification-ios'
import moment from 'moment'
import { AppState } from 'react-native'
import { Notifications } from 'react-native-notifications'
import { v4 as newUuid } from 'uuid'

import { pbx } from '#/api/pbx'
import { isAndroid, isWeb } from '#/config'
import { accountStore } from '#/stores/accountStore'
import { authPBX } from '#/stores/AuthPBX'
import { authSIP } from '#/stores/AuthSIP'
import { getAuthStore } from '#/stores/authStore'
import { Call } from '#/stores/Call'
import { getCallStore } from '#/stores/callStore'
import { getPartyName, getPartyNameAsync } from '#/stores/contactStore'
import { intl } from '#/stores/intl'
import { permForCallLog } from '#/utils/permissions'
import type { ParsedPn } from '#/utils/PushNotification-parse'
import { BrekekeUtils, CallLogType } from '#/utils/RnNativeModules'
import { waitTimeout } from '#/utils/waitTimeout'

const alreadyAddHistoryMap: { [pnId: string]: true } = {}
export const parseReasonCancelCall = (reason?: string) => {
  if (!reason) {
    return
  }

  const m = reason.match(/"([^"]+)"/i)
  if (!m) {
    return
  }
  return m[1]
}
export const getUserInfoFromReasons = (reason?: string | false) => {
  if (!reason) {
    return
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
    phoneNumber: m[2]?.trim() || m[1]?.trim(),
  }
}
export const getReasonCancelCall = async (ms?: {
  name: string
  phoneNumber: string
}) => {
  if (!ms) {
    return
  }
  let name = ms.name
  if (!name) {
    name = (await getPartyNameAsync(ms.phoneNumber)) || ms.phoneNumber
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
  const pnId = isTypeCall ? c.pnId : c.id

  if (pnId) {
    if (alreadyAddHistoryMap[pnId]) {
      return
    }
    alreadyAddHistoryMap[pnId] = true
  }

  if (!isTypeCall && !(await accountStore.findByPn(c))) {
    console.log(
      'checkAndRemovePnTokenViaSip debug: do not add history account not exist',
    )
    return
  }

  if (getAuthStore().pbxLoginFromAnotherPlace) {
    console.log(
      'pbxLoginFromAnotherPlace debug: dispose authSIP and authPBX after call finished',
    )
    authSIP.dispose()
    authPBX.dispose()
    getAuthStore().showMsgPbxLoginFromAnotherPlace = true
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
  const lineValue = line?.split('/')?.[0]?.trim() || line?.trim() || undefined
  const lineLabel = lineValue
    ? getAuthStore().resourceLines?.find(item => item.value === lineValue)?.key
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
          getPartyName({ partyNumber: c.from, preferPbxName: true }) ||
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
  const m = getCallStore().calleeRejectedMap
  const calleeRejected = m[c.callkeepUuid] || m[pnId]

  if (!calleeRejected) {
    presentNotification(info)
  }

  // try to wait for login?
  // TODO:
  // add method based on the Account class
  // allow multiple accounts at the same time
  const as = getAuthStore()
  const current = as.getCurrentAccount()
  if (!current) {
    await waitTimeout()
  }
  if (!as.getCurrentAccount()) {
    return
  }
  if (as.phoneappliEnabled()) {
    return
  }
  as.pushRecentCall(info)
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
  answeredBy?: { name: string; phoneNumber: string }
  lineLabel?: string
  lineValue?: string
  to?: string
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
  if (!c.reason || !c.answeredBy) {
    return c.partyName || c.partyNumber
  }

  const auth = getAuthStore()
  if (!auth.phoneappliEnabled()) {
    return intl`The call from ${c.partyName || c.partyNumber} is ${c.reason}`
  }

  const { name, phoneNumber } = c.answeredBy
  const r = intl`The call from ${
    c.partyName || c.partyNumber
  } is answered by someone else`

  const ca = auth.getCurrentAccount()
  if (!ca) {
    return r
  }
  const { pbxTenant, pbxUsername } = ca
  try {
    const rs = await pbx.getPhoneappliContact(
      pbxTenant,
      pbxUsername,
      phoneNumber,
    )
    return intl`The call from ${c.partyName || c.partyNumber} is answered by ${
      rs?.display_name || name || phoneNumber
    }`
  } catch (err) {
    return r
  }
}

const presentNotification = async (c: CallHistoryInfo) => {
  if (isWeb) {
    return
  }
  // if two users answer a call at the same time, the system will automatically end the call for the second user to join
  // the second user will receive a reason: "Call completed by ..."
  // --> c.answered = true, c.reason = "..." -> show notify
  const shouldPresent = c.answered && c.reason
  if ((c.answered || !c.incoming || c.isAboutToHangup) && !shouldPresent) {
    return
  }
  const title = intl`Missed call`
  const body = await getBodyForNotification(c)

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
  } else {
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
