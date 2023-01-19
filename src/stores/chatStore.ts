import PushNotificationIOS from '@react-native-community/push-notification-ios'
import { sortBy, uniqBy } from 'lodash'
import { computed, observable } from 'mobx'
import { AppState, Platform } from 'react-native'
import FCM from 'react-native-fcm'

import { Conference } from '../api/brekekejs'
import { Constants, uc } from '../api/uc'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { filterTextOnly } from '../utils/formatChatContent'
import { saveBlobFile } from '../utils/saveBlob'
import { showWebNotification } from '../utils/showWebNotification'
import { arrToMap } from '../utils/toMap'
import { playDing, vibration } from '../utils/vibrationAndSound'
import { accountStore } from './accountStore'
import { getAuthStore } from './authStore'
import { getCallStore } from './callStore'
import { getPartyName } from './contactStore'
import { RnStacker } from './RnStacker'

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
  save?: 'started' | 'success' | 'failure'
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
export const FileEvent = {
  onFileReceived: 'onFileReceived',
  onFileProgress: 'onFileProgress',
  onFileFinished: 'onFileFinished',
}
export const TIMEOUT_TRANSFER_IMAGE = 60000
export const TIMEOUT_TRANSFER_VIDEO = 180000

class ChatStore {
  timeoutTransferImage: { [k: string]: number } = {}

  @observable messagesByThreadId: { [k: string]: ChatMessage[] } = {}
  getMessagesByThreadId = (id: string) => this.messagesByThreadId[id] || []

  @observable threadConfig: { [k: string]: ChatMessageConfig } = {}
  @computed get unreadCount() {
    const idMap: { [k: string]: boolean } = {}
    const l1 = filterTextOnly(
      Object.values(this.threadConfig).filter(v => {
        idMap[v.id] = true
        return v.isUnread && this.getMessagesByThreadId(v.id).length
      }) as any,
    ).length
    const as = getAuthStore()
    const d = as.getCurrentData()
    if (!d) {
      accountStore.getAccountDataAsync(as.getCurrentAccount())
    }
    const l2 = filterTextOnly(
      d?.recentChats.filter(c => !idMap[c.id] && c.unread),
    ).length
    return l1 + l2
  }
  getNumberWebchatNoti = () =>
    this.groups.filter(
      s =>
        s.webchat &&
        s.webchat.conf_status === Constants.CONF_STATUS_INVITED_WEBCHAT,
    )?.length

  // threadId can be uc user id or group id
  // TODO threadId can be duplicated between them
  @computed get threadIdsOrderedByRecent() {
    return sortBy(
      Object.keys(this.messagesByThreadId),
      k => this.getMessagesByThreadId(k)[0]?.created || -1,
    )
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

  pushChatNotification = (title: string, body: string, threadId?: string) => {
    if (Platform.OS === 'web') {
      return
    }

    if (Platform.OS === 'android') {
      FCM.presentLocalNotification({
        title,
        body,
        threadId,
        number: 0,
        priority: 'high',
        show_in_foreground: true,
        local_notification: true,
        wake_screen: false,
        ongoing: false,
        lights: true,
        channel: 'default',
        icon: 'ic_launcher',
        id: `message-${Date.now()}`,
        pre_app_state: AppState.currentState,
        my_custom_data: 'local_notification',
        is_local_notification: 'local_notification',
      })
    } else {
      PushNotificationIOS.getApplicationIconBadgeNumber(badge => {
        badge = Number(badge) || 0
        PushNotificationIOS.addNotificationRequest({
          id: `message-${Date.now()}`,
          title,
          body,
          badge,
          sound: undefined,
          userInfo: {
            id: `message-${Date.now()}`,
            aps: {
              title,
              threadId,
              body,
              my_custom_data: 'local_notification',
              pre_app_state: AppState.currentState,
              local_notification: true,
              is_local_notification: 'local_notification',
            },
          },
        })
      })
    }
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
    const messages = this.getMessagesByThreadId(threadId)
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

    // show chat in-app notification
    let name = ''
    if (isGroup) {
      name = chatStore.getGroupById(threadId)?.name
    } else {
      // user not set username
      name = getPartyName(threadId) || threadId
    }

    // show desktop notification for Web platform
    if (
      Platform.OS === 'web' &&
      this.getThreadConfig(threadId).isUnread &&
      m.length === 1
    ) {
      const messageNotification = name + ': ' + m[0]?.text || ''
      showWebNotification(messageNotification, name)
    }

    if (m.length === 1 && AppState.currentState !== 'active') {
      this.pushChatNotification(name, m[0]?.text || '', threadId)
    }
    // play chat notification sound & vibration
    const cs = getCallStore()
    const isTalking =
      cs.calls.some(c => c.answered) ||
      Object.values(cs.callkeepActionMap).some(a => a === 'answerCall')
    const s = RnStacker.stacks[RnStacker.stacks.length - 1] as any as {
      groupId?: string
      buddy?: string
      name?: string
    }
    const shouldPlayChatNotificationSoundVibration =
      !isTalking &&
      AppState.currentState === 'active' &&
      (isGroup
        ? !(s?.name === 'PageChatGroupDetail' && s?.groupId === threadId)
        : !(s?.name === 'PageChatDetail' && s?.buddy === threadId))
    if (shouldPlayChatNotificationSoundVibration) {
      this.playChatNotificationSoundVibration()
    }
  }

  @observable chatNotificationSoundRunning: boolean = false
  private playChatNotificationSoundVibration = () => {
    if (Platform.OS === 'web') {
      playDing()
      return
    }
    if (this.chatNotificationSoundRunning) {
      return
    }
    vibration()
    this.chatNotificationSoundRunning = true
    BackgroundTimer.setTimeout(() => {
      this.chatNotificationSoundRunning = false
    }, 700)
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
    Object.assign(f, { save: 'started' })
    chatStore.upsertFile(f)
    saveBlobFile(f.id, f.topic_id, f.fileType)
      .then(url => {
        this.filesMap[f.id] = Object.assign(this.filesMap[f.id], {
          url,
          save: 'success',
        })
      })
      .catch(() => {
        this.filesMap[f.id] = Object.assign(this.filesMap[f.id], {
          url: '',
          save: 'failure',
        })
      })
  }
  startTimeout = (id: string, fileType?: string) => {
    if (!this.timeoutTransferImage[id]) {
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
  updateTimeout = (id: string) => {
    if (!!this.timeoutTransferImage[id]) {
      this.clearTimeout(id)
      this.startTimeout(id)
    }
  }

  upsertFile = (
    f: Partial<ChatFile> & Pick<ChatFile, 'id'>,
    fromEvent?: string,
  ) => {
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
      const state =
        f.state === 'stopped' || f.state === 'success' || f.state === 'failure'
      this.filesMap[f.id] = Object.assign(f0, f)
      if (fromEvent && fromEvent === FileEvent.onFileProgress) {
        this.updateTimeout(f.id)
      } else {
        if (state) {
          this.clearTimeout(f.id)
        }
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

export const chatStore = new ChatStore()
