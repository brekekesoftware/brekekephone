import moment from 'moment'
import { v4 as newUuid } from 'uuid'

import { ParsedPn } from '../utils/PushNotification-parse'
import { getAuthStore } from './authStore'
import { Call } from './Call'
import { contactStore } from './contactStore'

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
      partyName: getPartyName(c.from) || c.from,
      partyNumber: c.from,
      duration: 0,
    })
  }
}

export const getPartyName = (partyNumber?: string) =>
  (partyNumber && contactStore.getPbxUserById(partyNumber)?.name) ||
  contactStore.getPhoneBookByPhoneNumber(partyNumber)?.name