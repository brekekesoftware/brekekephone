import moment from 'moment'

import uc from '../api/uc'
import intl from '../intl/intl'

export const numberOfChatsPerLoad = 20

export const groupByTimestamp = arr => {
  const me = uc.me()
  const groupByDate = []
  if (!arr?.length) {
    return groupByDate
  }
  let lastDate = null
  let groupByTime = null
  let lastMessage = null
  let messages = null
  arr.forEach(m => {
    const d = moment(m.created)
    const date = d.format('MMM D')
    if (!lastDate || date !== lastDate) {
      groupByTime = []
      lastDate = date
      groupByDate.push({
        date: formatDateSemantic(m.created),
        groupByTime,
      })
    }
    if (
      !lastMessage ||
      m.creator !== lastMessage.creator ||
      moment(m.created).valueOf() - moment(lastMessage.created).valueOf() >
        10 * 60000
    ) {
      const time = d.format('HH:mm') // TODO intl
      lastMessage = m
      messages = []
      groupByTime.push({
        time,
        messages,
        createdByMe: m.creator === me.id,
      })
    }
    messages.push(m)
  })
  return groupByDate
}

export const formatDateSemantic = d => {
  d = moment(d)
  const t = moment()
  if (d.format('yyyy') !== t.format('yyyy')) {
    return d.format('DD/MM/yyyy') // TODO intl
  }
  const today = t.format('MMM D')
  const yesterday = t.add(-1, 'days').format('MMM D')
  const date = d.format('MMM D') // TODO intl
  return date === today
    ? intl`Today`
    : date === yesterday
    ? intl`Yesterday`
    : date
}

export const formatDateTimeSemantic = d => {
  d = moment(d)
  const t = moment()
  let date = ''
  if (d.format('yyyy') !== t.format('yyyy')) {
    date = d.format('DD/MM/yyyy') // TODO intl
  } else if (d.format('MMM D') !== t.format('MMM D')) {
    date = d.format('MMM D') // TODO intl
  }
  if (date) {
    date = ' ' + date
  }
  const time = d.format('HH:mm') // TODO intl
  return time + date
}
