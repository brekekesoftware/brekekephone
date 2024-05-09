import PushNotificationIOS from '@react-native-community/push-notification-ios'
import { decode } from 'html-entities'
import { sortBy, uniqBy } from 'lodash'
import { action, computed, observable } from 'mobx'
import { AppState, Platform } from 'react-native'
import { Notifications } from 'react-native-notifications'

import { uc } from '../api/uc'
import type { Conference } from '../brekekejs'
import { Constants } from '../brekekejs/ucclient'
import { arrToMap } from '../utils/arrToMap'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { filterTextOnly } from '../utils/formatChatContent'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { rnVibrate } from '../utils/rnVibrate'
import { saveBlobFile } from '../utils/saveBlob'
import { webPlayDing } from '../utils/webPlayDing'
import { webShowNotification } from '../utils/webShowNotification'
import { accountStore } from './accountStore'
import { getAuthStore, waitUc } from './authStore'
import { getCallStore } from './callStore'
import { getPartyName } from './contactStore'
import { intl } from './intl'
import { Nav } from './Nav'
import { RnAlert } from './RnAlert'
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
    const ca = as.getCurrentAccount()
    const d = as.getCurrentData()
    if (!d && ca) {
      accountStore.findDataWithDefault(ca)
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
  getWebChatInactiveIds = () =>
    this.groups
      .filter(
        gr =>
          gr.webchat && gr.webchat.conf_status !== Constants.CONF_STATUS_JOINED,
      )
      .map(item => item.id)
  isWebchatJoined = (conf_id: string) =>
    this.groups
      .filter(
        gr =>
          gr.webchat && gr.webchat.conf_status === Constants.CONF_STATUS_JOINED,
      )
      .some(w => w.id === conf_id)
  isWebchat = (conf_id: string) =>
    this.groups.filter(gr => gr.webchat).some(w => w.id === conf_id)

  pushChatNotification = (
    title: string,
    body: string,
    threadId?: string,
    isGroupChat?: boolean,
  ) => {
    if (Platform.OS === 'web') {
      return
    }
    body = decode(body)
    const id = `message-${Date.now()}`
    if (Platform.OS === 'android') {
      Notifications.postLocalNotification({
        payload: {
          id,
          title,
          body,
          threadId,
          isGroupChat,
          number: 0,
          sound: '',
          priority: 'high',
          show_in_foreground: true,
          local_notification: true,
          wake_screen: false,
          ongoing: false,
          lights: true,
          channel: 'brekeke_chat',
          icon: 'ic_launcher',
          pre_app_state: AppState.currentState,
          my_custom_data: 'local_notification',
          is_local_notification: 'local_notification',
        },
        identifier: id,
        body,
        title,
        sound: 'ding.mp3',
        badge: 0,
        type: '',
        thread: '',
      })
    } else {
      PushNotificationIOS.getApplicationIconBadgeNumber(badge => {
        badge = Number(badge) || 0
        PushNotificationIOS.addNotificationRequest({
          id,
          title,
          body,
          badge,
          sound: 'ding.mp3',
          userInfo: {
            id,
            aps: {
              title,
              threadId,
              isGroupChat,
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
      webShowNotification(messageNotification, name)
    }

    if (m.length === 1 && AppState.currentState !== 'active') {
      this.pushChatNotification(name, m[0]?.text || '', threadId, isGroup)
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

  handleMoveToChatGroupDetail = async (groupId: string) => {
    const as = getAuthStore()
    const ca = as.getCurrentAccount()
    if (!ca?.ucEnabled) {
      // this should not happen
      const msg = !ca ? 'not signed in' : 'UC is disabled'
      throw new Error(`Failed to handle UC group chat: ${msg}`)
    }
    if (as.ucState !== 'success') {
      RnAlert.prompt({
        title: '...',
        message: intl`Connecting to ${'UC'}...`,
        confirmText: 'OK',
        dismissText: false,
      })
      await waitUc()
      RnAlert.dismiss()
    }
    const nav = Nav()
    const i: Conference = uc.getChatGroupInfo(groupId)
    const status = i.conf_status
    const name = i.subject || groupId
    if (status === Constants.CONF_STATUS_INACTIVE) {
      RnAlert.prompt({
        title: name,
        message: intl`You have rejected this group or it has been deleted`,
        confirmText: 'OK',
        dismissText: false,
      })
      const d = await as.getCurrentDataAsync()
      if (d) {
        d.recentChats = d.recentChats.filter(c => c.id !== groupId)
        accountStore.saveAccountsToLocalStorageDebounced()
      }
    } else if (status === Constants.CONF_STATUS_INVITED) {
      RnAlert.prompt({
        title: name,
        message: intl`Do you want to join this group?`,
        confirmText: intl`Join`,
        onConfirm: async () => {
          await uc.joinChatGroup(groupId)
          nav.customPageIndex = nav.goToPageChatGroupDetail
          nav.goToPageChatGroupDetail({ groupId })
        },
        onDismiss: () => {
          uc.leaveChatGroup(groupId).catch(() => {})
        },
      })
    } else {
      nav.customPageIndex = nav.goToPageChatGroupDetail
      nav.goToPageChatGroupDetail({ groupId })
    }
  }
  @observable chatNotificationSoundRunning: boolean = false
  private playChatNotificationSoundVibration = async () => {
    if (Platform.OS === 'web') {
      webPlayDing()
      return
    }
    if (this.chatNotificationSoundRunning) {
      return
    }
    const playSoundAndVibrate = () => {
      rnVibrate()
      this.chatNotificationSoundRunning = true
      BackgroundTimer.setTimeout(() => {
        this.chatNotificationSoundRunning = false
      }, 700)
    }
    if (Platform.OS === 'ios') {
      // ios already check by <Video> with ignoreSilentSwitch
      playSoundAndVibrate()
      return
    }
    const rm = await BrekekeUtils.getRingerMode()
    // unknown or RINGER_MODE_SILENT
    if (rm <= 0) {
      return
    }
    // RINGER_MODE_VIBRATE
    if (rm === 1) {
      rnVibrate()
      return
    }
    // RINGER_MODE_NORMAL
    playSoundAndVibrate()
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
    if (this.timeoutTransferImage[id]) {
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
  @action removeFile = (id: string) => {
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
  @action removeGroup = (id: string) => {
    delete this.messagesByThreadId[id]
    delete this.threadConfig[id]
    this.groups = this.groups.filter(gr => gr.id !== id)
  }
  @computed private get groupsMap() {
    return arrToMap(this.groups, 'id', (g: ChatGroup) => g) as {
      [k: string]: ChatGroup
    }
  }
  getGroupById = (id: string) => this.groupsMap[id]

  clearStore = () => {
    this.messagesByThreadId = {}
    this.threadConfig = {}
    this.groups = []
    this.filesMap = {}
    this.timeoutTransferImage = {}
  }
}

export const chatStore = new ChatStore()
