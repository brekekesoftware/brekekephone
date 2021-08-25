import { decode } from 'html-entities'

import { getAuthStore } from '../stores/authStore'
import { ChatTarget } from '../stores/chatStore'
import { intl } from '../stores/intl'
import { formatDuration } from './formatDuration'

export const formatChatContent = (c: {
  text?: string
  creatorId?: string
  type?: number
  ctype?: number
}) => {
  const type = c.type || c.ctype
  let text = c.text || ''
  const originalText = text
  if (type !== 1) {
    let o: {
      name?: string
      talklen?: number
      file_id?: string
      additionals?: []
      target?: ChatTarget
    } = {}
    try {
      o = JSON.parse(text)
    } catch (err) {}
    if (typeof o.talklen === 'number' || typeof o.talklen === 'string') {
      text = !c.creatorId
        ? intl`Call duration: ${formatDuration(o.talklen)}`
        : c.creatorId === getAuthStore().currentProfile?.pbxUsername
        ? intl`Outgoing call, duration: ${formatDuration(o.talklen)}`
        : intl`Incoming call, duration: ${formatDuration(o.talklen)}`
    } else if (o.name && o.file_id) {
      text = `${o.name} ${!o.additionals ? `-> ${o.target?.user_id}` : ''}`
    } else if (o.name && !o.file_id) {
      text = o.name
    }
  }

  // Fix migrate error from apps backend?
  let isTextOnly = text.endsWith(' .txt')
  if (isTextOnly) {
    text = text.replace(/ \.txt$/, '')
  }
  isTextOnly = isTextOnly || type === 1 || !originalText.startsWith('{')

  return {
    text: decode(text),
    isTextOnly,
  }
}

export const filterTextOnly = <
  T extends {
    text?: string
    creatorId?: string
    type?: number
    ctype?: number
  },
>(
  arr?: T[],
): T[] => (arr || []).filter(c => formatChatContent(c).isTextOnly)
