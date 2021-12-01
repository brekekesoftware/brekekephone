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

  const id = newUuid()
  const created = moment().format('HH:mm - MMM D')
  const info = isTypeCall
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

  getAuthStore().pushRecentCall(info)
  presentNotification(info)
}

const presentNotification = (info: {
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
  if (AppState.currentState === 'active' || info.answered || !info.incoming) {
    return
  }
  const body = intl`Missed call from ${info.partyName}`
  if (Platform.OS === 'android') {
    FCM.presentLocalNotification({
      body,
      title: info.partyNumber,
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
        body,
        title: info.partyNumber,
        sound: undefined,
        badge,
        userInfo: {
          id: `missedcall-${Date.now()}`,
          aps: {
            body,
            title: info.partyNumber,
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
