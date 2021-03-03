import { getAuthStore } from '../stores/authStore'
import intl from '../stores/intl'
import formatDuration from './formatDuration'

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
    } else if (o.name) {
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
    text,
    isTextOnly,
  }
}

export const filterTextOnly = <
  T extends {
    text?: string
    creatorId?: string
    type?: number
    ctype?: number
  }
>(
  arr?: T[],
): T[] => (arr || []).filter(c => formatChatContent(c).isTextOnly)
