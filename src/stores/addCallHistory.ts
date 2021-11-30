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
export const addCallHistory = (c: Call | ParsedPn) => {
  console.log('addCallHistory', c)

  const isTypeCall = c instanceof Call || 'partyName' in c || 'partyNumber' in c
  if (isTypeCall && c.partyName === 'Voicemails') {
    return
  }

  const pnId = isTypeCall ? c.pnId : c.id

  if (pnId) {
    if (alreadyAddHistoryMap[pnId]) {
      return
    }
    alreadyAddHistoryMap[pnId] = true
  }
  const as = getAuthStore()
  const id = newUuid()
  const created = moment().format('HH:mm - MMM D')
  const callInfo = isTypeCall
    ? {
        id,
        created,
        incoming: c.incoming,
        answered: c.answered,
        partyName: c.title,
        partyNumber: c.partyNumber,
        duration: c.getDuration(),
      }
    : {
        id,
        created,
        incoming: true,
        answered: false,
        partyName: getPartyName(c.from) || c.displayName,
        partyNumber: c.from,
        duration: 0,
      }
  as.pushRecentCall(callInfo)
  // present notification and badge ios
  // presentNotification(callInfo)
  if (
    AppState.currentState !== 'active' &&
    (!isTypeCall || !c.isAboutToHangup)
  ) {
    presentNotification(callInfo)
  }
}

const presentNotification = (callInfo: {
  id: string
  incoming: boolean
  answered: boolean
  partyName: string
  partyNumber: string
  duration: number
  created: string
}) => {
  if (Platform.OS === 'web') {
    return
  }
  if (Platform.OS === 'android') {
    FCM.presentLocalNotification({
      body: intl`Miss call`,
      title: callInfo.partyNumber,
      number: 0,
      priority: 'high',
      show_in_foreground: true,
      local_notification: true,
      wake_screen: false,
      ongoing: false,
      lights: true,
      channel: 'default',
      icon: 'ic_launcher',
      id: `misscall-${Date.now()}`,
      pre_app_state: AppState.currentState,
      my_custom_data: 'local_notification',
      is_local_notification: 'local_notification',
    })
  } else {
    PushNotificationIOS.getApplicationIconBadgeNumber(badge => {
      badge = 1 + (Number(badge) || 0)
      PushNotificationIOS.addNotificationRequest({
        id: `misscall-${Date.now()}`,
        body: intl`Miss call`,
        title: callInfo.partyNumber,
        sound: undefined,
        badge,
        userInfo: {
          id: `misscall-${Date.now()}`,
          aps: {
            body: intl`Miss call`,
            title: callInfo.partyNumber,
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
