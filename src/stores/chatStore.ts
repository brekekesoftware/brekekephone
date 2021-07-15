import sortBy from 'lodash/sortBy'
import uniqBy from 'lodash/uniqBy'
import { computed, observable } from 'mobx'

import { Conference } from '../api/brekekejs'
import uc, { Constants } from '../api/uc'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { filterTextOnly } from '../utils/formatChatContent'
import { saveBlobFile } from '../utils/saveBlob'
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
  fileType: string
  url?: string
  target?: ChatTarget
  topic_id: string
}
export type ChatTarget = {
  tenant: string
  user_id: string
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
export const TIMEOUT_TRANSFER_IMAGE = 60000
export const TIMEOUT_TRANSFER_VIDEO = 180000

class ChatStore {
  timeoutTransferImage: { [k: string]: number } = {}

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
        gr =>
          gr.webchat && gr.webchat.conf_status !== Constants.CONF_STATUS_JOINED,
      )
      .map(item => item.id)
  }
  isWebchatJoined(conf_id: string) {
    return this.groups
      .filter(
        gr =>
          gr.webchat && gr.webchat.conf_status === Constants.CONF_STATUS_JOINED,
      )
      .some(w => w.id === conf_id)
  }
  isWebchat(conf_id: string) {
    return this.groups.filter(gr => gr.webchat).some(w => w.id === conf_id)
  }
  pushMessages = (
    threadId: string,
    m: ChatMessage | ChatMessage[],
    isUnread = false,
  ) => {
    const isGroup = this.groups.some(gr => gr.id === threadId)
    const isWebchatJoined = this.isWebchatJoined(threadId)
    const isWebchat = this.isWebchat(threadId)
    if (!Array.isArray(m)) {
      m = [m]
    }
    const messages = this.messagesByThreadId[threadId] || []
    messages.push(...m)
    this.messagesByThreadId[threadId] = sortBy(
      uniqBy(messages, 'id'),
      'created',
    )

    const a2 = filterTextOnly(m)
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

  @observable private filesMap: { [k: string]: ChatFile } = {}

  download = (f: ChatFile) => {
    saveBlobFile(f.id, f.topic_id, f.fileType)
      .then(url => {
        this.filesMap[f.id] = Object.assign(this.filesMap[f.id], {
          url: url,
        })
      })
      .catch(() => {
        this.filesMap[f.id] = Object.assign(this.filesMap[f.id], {
          url: '',
        })
      })
  }
  startTimeout = (id: string, fileType?: string) => {
    if (!!!this.timeoutTransferImage[id]) {
      this.timeoutTransferImage[id] = BackgroundTimer.setTimeout(
        () => {
          this.clearTimeout(id)
          uc.rejectFile({ id })
        },
        fileType === 'video' ? TIMEOUT_TRANSFER_VIDEO : TIMEOUT_TRANSFER_IMAGE,
      )
    }
  }
  clearTimeout = (id: string) => {
    if (this.timeoutTransferImage[id]) {
      BackgroundTimer.clearTimeout(this.timeoutTransferImage[id])
      delete this.timeoutTransferImage[id]
    }
  }
  upsertFile = (f: Partial<ChatFile> & Pick<ChatFile, 'id'>) => {
    const f0 = this.filesMap[f.id]
    if (!f0) {
      this.filesMap[f.id] = f as ChatFile
      const fileTypeImageVideo =
        f.fileType === 'image' || f.fileType === 'video'
      if (f.incoming && fileTypeImageVideo) {
        this.download(f as ChatFile)
      }
      this.startTimeout(f.id, f.fileType)
    } else {
      this.filesMap[f.id] = Object.assign(f0, f)
      const state =
        f.state === 'stopped' || f.state === 'success' || f.state === 'failure'
      if (state) {
        // this.clearTimeout(f.id)
      }
    }
  }
  removeFile = (id: string) => {
    delete this.filesMap[id]
  }
  getFileById = (id?: string) => (id ? this.filesMap[id] : undefined)

  @observable groups: ChatGroup[] = []
  upsertGroup = (g: Partial<ChatGroup> & Pick<ChatGroup, 'id'>) => {
    // add default webchatMessages
    const g0 = this.getGroupById(g.id)
    if (g0) {
      Object.assign(g0, g)
    } else {
      this.groups.push(g as ChatGroup)
    }
    this.groups = [...this.groups]
  }
  removeGroup = (id: string) => {
    delete this.messagesByThreadId[id]
    delete this.threadConfig[id]
    this.groups = this.groups.filter(gr => gr.id !== id)
  }
  @computed private get groupsMap() {
    return arrToMap(this.groups, 'id', (g: ChatGroup) => g) as {
      [k: string]: ChatGroup
    }
  }
  getGroupById = (id: string) => {
    return this.groupsMap[id]
  }

  clearStore = () => {
    this.messagesByThreadId = {}
    this.threadConfig = {}
    this.groups = []
    this.filesMap = {}
    this.timeoutTransferImage = {}
  }
}

export default new ChatStore()
