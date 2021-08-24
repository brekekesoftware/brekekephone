import moment from 'moment'
import { v4 as newUuid } from 'uuid'

import { ParsedPn } from '../utils/PushNotification-parse'
import { getAuthStore } from './authStore'
import Call from './Call'

const alreadyAddHistoryMap: { [pnId: string]: true } = {}
export const addCallHistory = (c: Call | ParsedPn) => {
  const pnId =
    c instanceof Call || 'partyName' in c || 'partyNumber' in c ? c.pnId : c.id
  if (pnId) {
    if (alreadyAddHistoryMap[pnId]) {
      return
    }
    alreadyAddHistoryMap[pnId] = true
  }
  const as = getAuthStore()
  const id = newUuid()
  const created = moment().format('HH:mm - MMM D')
  if (c instanceof Call || 'partyName' in c || 'partyNumber' in c) {
    as.pushRecentCall({
      id,
      created,
      incoming: c.incoming,
      answered: c.answered,
      partyName: c.partyName,
      partyNumber: c.partyNumber,
      duration: c.duration,
    })
  } else {
    as.pushRecentCall({
      id,
      created,
      incoming: true,
      answered: false,
      partyName: c.from,
      partyNumber: c.from,
      duration: 0,
    })
  }
}
