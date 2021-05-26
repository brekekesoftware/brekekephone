import sortBy from 'lodash/sortBy'
import uniqBy from 'lodash/uniqBy'
import { computed, observable } from 'mobx'

import { Conference } from '../api/brekekejs'
import { Constants } from '../api/uc'
import { filterTextOnly } from '../utils/formatChatContent'
import { arrToMap } from '../utils/toMap'
import { getAuthStore } from './authStore'

export type ChatMessage = {
  id: string
  text?: string
  file?: string
  type: number
  creator: string
  created: number
  conf_id?: string
}
export type ChatFile = {
  id: string
  name: string
  incoming: boolean
  size: number
  state: string // 'waiting' | 'started' | 'success' | 'stopped' | 'failure'
  transferPercent: number
}
export type ChatMessageConfig = {
  id: string
  isUnread: boolean
  isGroup: boolean
  allMessagesLoaded?: boolean
}
export type ChatGroup = {
  id: string
  name: string
  inviter: string
  jointed: boolean
  members: string[]
  webchat?: Conference // check group is webchat
}

class ChatStore {
  @observable messagesByThreadId: { [k: string]: ChatMessage[] } = {}
  @observable threadConfig: { [k: string]: ChatMessageConfig } = {}
  @computed get unreadCount() {
    const idMap: { [k: string]: boolean } = {}
    const l1 = filterTextOnly(
      Object.values(this.threadConfig).filter(v => {
        idMap[v.id] = true
        return v.isUnread && this.messagesByThreadId[v.id]?.length
      }) as any,
    ).length
    const l2 = filterTextOnly(
      getAuthStore().currentData.recentChats.filter(
        c => !idMap[c.id] && c.unread,
      ),
    ).length
    return l1 + l2
  }
  @computed get numberNoticesWebchat() {
    return this.groups.filter(
      s =>
        s.webchat &&
        s.webchat.conf_status === Constants.CONF_STATUS_INVITED_WEBCHAT,
    )?.length
  }
  // threadId can be uc user id or group id
  // TODO threadId can be duplicated between them
  @computed get threadIdsOrderedByRecent() {
    return sortBy(Object.keys(this.messagesByThreadId), k => {
      const messages = this.messagesByThreadId[k]
      if (!messages?.length) {
        return -1
      }
      return messages[0].created
    })
  }
  getWebChatInactiveIds() {
    return this.groups
      .filter(
        g =>
          g.webchat && g.webchat.conf_status !== Constants.CONF_STATUS_JOINED,
      )
      .map(item => item.id)
  }
  isWebchatJoined(conf_id: string) {
    return this.groups
      .filter(
        g =>
          g.webchat && g.webchat.conf_status === Constants.CONF_STATUS_JOINED,
      )
      .some(w => w.id === conf_id)
  }
  isWebchat(conf_id: string) {
    return this.groups.filter(g => g.webchat).some(w => w.id === conf_id)
  }
  pushMessages = (
    threadId: string,
    _m: ChatMessage | ChatMessage[],
    isUnread = false,
  ) => {
    const isGroup = this.groups.some(g => g.id === threadId)
    const isWebchatJoined = this.isWebchatJoined(threadId)
    const isWebchat = this.isWebchat(threadId)
    if (!Array.isArray(_m)) {
      _m = [_m]
    }
    const messages = this.messagesByThreadId[threadId] || []
    messages.push(..._m)
    this.messagesByThreadId[threadId] = sortBy(
      uniqBy(messages, 'id'),
      'created',
    )

    const a2 = filterTextOnly(_m)
    if (!a2.length || (isWebchat && !isWebchatJoined)) {
      return
    }
    this.updateThreadConfig(threadId, isGroup, {
      isUnread,
    })
  }

  removeWebchatItem = (conf_id: string) => {
    this.removeGroup(conf_id)
  }

  getThreadConfig = (id: string) =>
    this.threadConfig[id] || ({} as ChatMessageConfig)
  updateThreadConfig = (
    id: string,
    isGroup: boolean,
    c: Partial<ChatMessageConfig>,
  ) => {
    this.threadConfig = {
      ...this.threadConfig,
      [id]: {
        ...this.getThreadConfig(id),
        ...c,
        id,
        isGroup,
      },
    }
  }

  @observable filesMap: { [k: string]: ChatFile } = {}
  upsertFile = (_f: Partial<ChatFile> & Pick<ChatFile, 'id'>) => {
    const f = this.filesMap[_f.id]
    this.filesMap[_f.id] = f ? Object.assign(f, _f) : (_f as ChatFile)
  }
  removeFile = (id: string) => {
    delete this.filesMap[id]
  }

  @observable groups: ChatGroup[] = []
  upsertGroup = (_g: Partial<ChatGroup> & Pick<ChatGroup, 'id'>) => {
    // add default webchatMessages

    const g = this.getGroup(_g.id)
    if (g) {
      Object.assign(g, _g)
    } else {
      this.groups.push(_g as ChatGroup)
    }
    this.groups = [...this.groups]
  }
  removeGroup = (id: string) => {
    delete this.messagesByThreadId[id]
    delete this.threadConfig[id]
    this.groups = this.groups.filter(g => g.id !== id)
  }

  @computed get _groupsMap() {
    return arrToMap(this.groups, 'id', (g: ChatGroup) => g) as {
      [k: string]: ChatGroup
    }
  }
  getGroup = (id: string) => {
    return this._groupsMap[id]
  }

  clearStore = () => {
    this.messagesByThreadId = {}
    this.threadConfig = {}
    this.groups = []
    this.filesMap = {}
  }
}

export default new ChatStore()
