import moment from 'moment'

import { uc } from '../api/uc'
import { ChatMessage } from '../stores/chatStore'
import { intl } from '../stores/intl'

export const numberOfChatsPerLoad = 20

export const groupByTimestamp = (arr: ChatMessage[]) => {
  const me = uc.me()
  const groupByDate: {
    date: string
    groupByTime: {
      time: string
      messages: ChatMessage[]
      createdByMe: boolean
    }[]
  }[] = []
  if (!arr?.length) {
    return groupByDate
  }
  let lastDate: string
  let groupByTime: typeof groupByDate[0]['groupByTime']
  let lastMessage: ChatMessage
  let messages: ChatMessage[]
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

export const formatDateSemantic = (d0: number | string) => {
  const d = moment(d0)
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

export const formatDateTimeSemantic = (str: number | string) => {
  const d = moment(str)
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
  const time = moment(str).format('HH:mm') // TODO intl
  return time + date
}
