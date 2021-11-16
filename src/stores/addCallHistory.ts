import moment from 'moment'
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
}
