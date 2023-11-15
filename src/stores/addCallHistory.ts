import PushNotificationIOS from '@react-native-community/push-notification-ios'
import moment from 'moment'
import { AppState, Platform } from 'react-native'
import { Notifications } from 'react-native-notifications'
import { v4 as newUuid } from 'uuid'

import { getPartyName } from '../stores/contactStore'
import { permForCallLog } from '../utils/permissions'
import { ParsedPn } from '../utils/PushNotification-parse'
import { BrekekeUtils, CallLogType } from '../utils/RnNativeModules'
import { waitTimeout } from '../utils/waitTimeout'
import { accountStore } from './accountStore'
import { getAuthStore } from './authStore'
import { Call } from './Call'
import { getCallStore } from './callStore'
import { intl } from './intl'

const alreadyAddHistoryMap: { [pnId: string]: true } = {}
export const addCallHistory = async (c: Call | ParsedPn) => {
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

  const id = newUuid()
  const created = moment().format('HH:mm - MMM D')
  const info = isTypeCall
    ? {
        id,
        created,
        incoming: c.incoming,
        answered: c.answered,
        partyName: c.getDisplayName(),
        partyNumber: c.partyNumber,
        duration: c.getDuration(),
        isAboutToHangup: c.isAboutToHangup,
      }
    : {
        id,
        created,
        incoming: true,
        answered: false,
        partyName: getPartyName(c.from) || c.displayName || c.from,
        partyNumber: c.from,
        duration: 0,
        // TODO: B killed app, A call B, B reject quickly, then A cancel quickly
        // -> B got cancel event from sip
        isAboutToHangup: false,
      }

  // do not show notification if rejected by callee
  const m = getCallStore().calleeRejectedMap
  const calleeRejected = m[c.callkeepUuid] || m[pnId]
  if (!calleeRejected) {
    presentNotification(info)
  }

  // try to wait for login?
  // TODO
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
  as.pushRecentCall(info)
  if (Platform.OS === 'android') {
    addToCallLog(info)
  }
}
const addToCallLog = async (call: {
  id: string
  incoming: boolean
  answered: boolean
  partyName: string
  partyNumber: string
  duration: number
  created: string
}) => {
  if (!(await permForCallLog())) {
    return
  }
  const { incoming, answered, partyName, partyNumber } = call
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
const presentNotification = (c: {
  id: string
  incoming: boolean
  answered: boolean
  partyName: string
  partyNumber: string
  duration: number
  created: string
  isAboutToHangup: boolean
}) => {
  if (Platform.OS === 'web') {
    return
  }
  if (c.answered || !c.incoming || c.isAboutToHangup) {
    return
  }
  const title = intl`Missed call`
  const body = c.partyName || c.partyNumber
  if (Platform.OS === 'android') {
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
          },
        },
      })
      PushNotificationIOS.setApplicationIconBadgeNumber(badge)
    })
  }
}
