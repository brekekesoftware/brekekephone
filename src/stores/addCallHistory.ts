import PushNotificationIOS from '@react-native-community/push-notification-ios'
import moment from 'moment'
import { AppState, Platform } from 'react-native'
import FCM from 'react-native-fcm'
import { v4 as newUuid } from 'uuid'

import { getPartyName } from '../stores/contactStore'
import { ParsedPn } from '../utils/PushNotification-parse'
import { getAuthStore } from './authStore'
import { Call } from './Call'
import { intl } from './intl'

const alreadyAddHistoryMap: { [pnId: string]: true } = {}
export const addCallHistory = async (
  c: Call | ParsedPn,
  isCalleeRejectCall?: boolean,
) => {
  const isTypeCall = c instanceof Call || 'partyNumber' in c

  if (isTypeCall && c.partyNumber === '8') {
    return
  }

  if (!isTypeCall && !getAuthStore().currentProfile) {
    await getAuthStore().signInByNotification(c)
  }
  const pnId = isTypeCall ? c.pnId : c.id

  if (pnId) {
    if (alreadyAddHistoryMap[pnId]) {
      return
    }
    alreadyAddHistoryMap[pnId] = true
  }

  const id = newUuid()
  const created = moment().format('HH:mm - MMM D')
  const info = isTypeCall
    ? {
        id,
        created,
        incoming: c.incoming,
        answered: c.answered,
        partyName: c.computedName,
        partyNumber: c.partyNumber,
        duration: c.getDuration(),
        isAboutToHangup: c.isAboutToHangup,
        calleeClickReject: c.calleeClickReject,
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
        calleeClickReject: false,
      }

  getAuthStore().pushRecentCall(info)
  !isCalleeRejectCall && presentNotification(info)
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
  calleeClickReject: boolean
}) => {
  if (Platform.OS === 'web') {
    return
  }
  if (
    AppState.currentState === 'active' ||
    c.answered ||
    !c.incoming ||
    (c.isAboutToHangup && !c.calleeClickReject)
  ) {
    return
  }
  const title = intl`Missed call`
  const body = c.partyName || c.partyNumber
  if (Platform.OS === 'android') {
    FCM.presentLocalNotification({
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
