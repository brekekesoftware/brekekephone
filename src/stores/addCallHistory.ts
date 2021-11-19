import PushNotificationIOS, {
  PushNotification as PN,
} from '@react-native-community/push-notification-ios'
import moment from 'moment'
import { AppState, Platform } from 'react-native'
import FCM from 'react-native-fcm'
import { v4 as newUuid } from 'uuid'

import { getPartyName } from '../stores/contactStore'
import { ParsedPn } from '../utils/PushNotification-parse'
import { getAuthStore } from './authStore'
import { Call } from './Call'

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
  const as = getAuthStore()
  const id = newUuid()
  const created = moment().format('HH:mm - MMM D')
  if (isTypeCall) {
    as.pushRecentCall({
      id,
      created,
      incoming: c.incoming,
      answered: c.answered,
      partyName: c.title,
      partyNumber: c.partyNumber,
      duration: c.getDuration(),
    })
  } else {
    as.pushRecentCall({
      id,
      created,
      incoming: true,
      answered: false,
      partyName: getPartyName(c.from) || c.displayName,
      partyNumber: c.from,
      duration: 0,
    })
  }
  console.log('addCallHistory')
  if (AppState.currentState !== 'active' && (!isTypeCall || !c.answered)) {
    console.log('addCallHistory::active')
    // Platform.OS === 'android' &&
    //             FCM.presentLocalNotification({
    //               body: 'dsad',
    //               title: 'dasd',
    //               badge:10,
    //               number: 12,
    //               priority: 'high',
    //               show_in_foreground: true,
    //               local_notification: true,
    //               wake_screen: true,
    //               ongoing: false,
    //               lights: true,
    //               channel: 'default',
    //               icon: 'ic_launcher',
    //               my_custom_data: 'local_notification',
    //               is_local_notification: 'local_notification',
    //               content_available: 1
    //             })
    PushNotificationIOS.getApplicationIconBadgeNumber((numBadges: number) => {
      PushNotificationIOS.setApplicationIconBadgeNumber(numBadges + 1)
    })
  }
}
