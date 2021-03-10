import { action } from 'mobx'

import { getAuthStore } from '../stores/authStore'
import Call from '../stores/Call'
import callStore from '../stores/callStore'
import chatStore from '../stores/chatStore'
import contactStore from '../stores/contactStore'
import { intlDebug } from '../stores/intl'
import { waitSip } from '../stores/reconnectAndWaitSip'
import RnAlert from '../stores/RnAlert'
import pbx from './pbx'
import sip from './sip'
import { SyncPnToken } from './syncPnToken'
import uc from './uc'

class Api {
  constructor() {
    pbx.on('connection-started', this.onPBXConnectionStarted)
    pbx.on('connection-stopped', this.onPBXConnectionStopped)
    pbx.on('connection-timeout', this.onPBXConnectionTimeout)
    pbx.on('user-calling', this.onPBXUserCalling)
    pbx.on('user-ringing', this.onPBXUserRinging)
    pbx.on('user-talking', this.onPBXUserTalking)
    pbx.on('user-holding', this.onPBXUserHolding)
    pbx.on('user-hanging', this.onPBXUserHanging)
    pbx.on('voicemail-updated', this.onVoiceMailUpdated)
    sip.on('connection-started', this.onSIPConnectionStarted)
    sip.on('connection-stopped', this.onSIPConnectionStopped)
    sip.on('connection-timeout', this.onSIPConnectionTimeout)
    sip.on('session-started', this.onSIPSessionStarted)
    sip.on('session-updated', this.onSIPSessionUpdated)
    sip.on('session-stopped', this.onSIPSessionStopped)
    uc.on('connection-stopped', this.onUCConnectionStopped)
    uc.on('user-updated', this.onUCUserUpdated)
    uc.on('buddy-chat-created', this.onBuddyChatCreated)
    uc.on('group-chat-created', this.onGroupChatCreated)
    uc.on('chat-group-invited', this.onChatGroupInvited)
    uc.on('chat-group-revoked', this.onChatGroupRevoked)
    uc.on('chat-group-updated', this.onChatGroupUpdated)
    uc.on('file-received', this.onFileReceived)
    uc.on('file-progress', this.onFileProgress)
    uc.on('file-finished', this.onFileFinished)
  }

  onPBXConnectionStarted = () => {
    waitSip(async () => {
      const s = getAuthStore()
      if (!s.currentProfile) {
        return
      }
      try {
        const tenant = getAuthStore().currentProfile.pbxTenant
        const username = getAuthStore().currentProfile.pbxUsername
        const userIds = await pbx
          .getUsers(tenant)
          .then((ids: string[]) => ids.filter(id => id !== username))
        const users = await pbx.getOtherUsers(tenant, userIds)
        contactStore.pbxUsers = users
      } catch (err: unknown) {
        RnAlert.error({
          message: intlDebug`Failed to load PBX users`,
          err: err as Error,
        })
      }
      if (getAuthStore().isSignInByNotification) {
        return
      }
      SyncPnToken()
        .sync(getAuthStore().currentProfile)
        .then(() => SyncPnToken().syncForAllAccounts())
    })
  }
  onPBXConnectionStopped = () => {
    getAuthStore().pbxState = 'stopped'
  }
  onPBXConnectionTimeout = () => {
    getAuthStore().pbxState = 'failure'
    getAuthStore().pbxTotalFailure += 1
  }
  onPBXUserCalling = (ev: UserTalkerEvent) => {
    contactStore.setTalkerStatus(ev.user, ev.talker, 'calling')
  }
  onPBXUserRinging = (ev: UserTalkerEvent) => {
    contactStore.setTalkerStatus(ev.user, ev.talker, 'ringing')
  }
  onPBXUserTalking = (ev: UserTalkerEvent) => {
    contactStore.setTalkerStatus(ev.user, ev.talker, 'talking')
  }
  onPBXUserHolding = (ev: UserTalkerEvent) => {
    contactStore.setTalkerStatus(ev.user, ev.talker, 'holding')
  }
  onPBXUserHanging = (ev: UserTalkerEvent) => {
    contactStore.setTalkerStatus(ev.user, ev.talker, '')
  }
  onVoiceMailUpdated = (ev: { new: number }) => {
    callStore.newVoicemailCount = ev?.new || 0
  }

  @action onSIPConnectionStarted = () => {
    const s = getAuthStore()
    s.sipState = 'success'
    s.sipPn = {}
  }
  onSIPConnectionStopped = (e: { reason: string; response: string }) => {
    if (!e?.reason && !e?.response) {
      getAuthStore().sipState = 'stopped'
    } else {
      getAuthStore().sipState = 'failure'
      getAuthStore().sipTotalFailure += 1
    }
    window.setTimeout(() => sip.disconnect(), 300)
  }
  onSIPConnectionTimeout = () => {
    getAuthStore().sipState = 'failure'
    getAuthStore().sipTotalFailure += 1
    sip.disconnect()
  }
  onSIPSessionStarted = (call: Call) => {
    const number = call.partyNumber
    if (number === '8') {
      call.partyName = 'Voicemails'
    }
    if (!call.partyName) {
      call.partyName = contactStore.getPBXUser(number)?.name
    }
    callStore.upsertCall(call)
  }
  onSIPSessionUpdated = (call: Call) => {
    callStore.upsertCall(call)
  }
  onSIPSessionStopped = (id: string) => {
    callStore.removeCall(id)
  }

  onUCConnectionStopped = () => {
    getAuthStore().ucState = 'stopped'
  }
  onUCConnectionTimeout = () => {
    getAuthStore().ucState = 'failure'
    getAuthStore().ucTotalFailure += 1
  }
  onUCUserUpdated = (ev: {
    id: string
    name: string
    avatar: string
    status: string
    statusText: string
  }) => {
    contactStore.updateUCUser(ev)
  }
  onBuddyChatCreated = (chat: {
    id: string
    creator: string
    text?: string
    type: number
    file?: string
    created: number
  }) => {
    chatStore.pushMessages(chat.creator, chat, true)
  }
  onGroupChatCreated = (chat: {
    id: string
    group: string
    creator: string
    text?: string
    type: number
    file?: string
    created: number
  }) => {
    chatStore.pushMessages(chat.group, chat, true)
  }
  onChatGroupInvited = (group: {
    id: string
    name: string
    inviter: string
    members: string[]
  }) => {
    chatStore.upsertGroup(group)
  }
  onChatGroupUpdated = (group: {
    id: string
    name: string
    jointed: boolean
    members: string[]
  }) => {
    chatStore.upsertGroup(group)
  }
  onChatGroupRevoked = (group: { id: string }) => {
    chatStore.removeGroup(group.id)
  }
  onFileReceived = (file: {
    id: string
    name: string
    size: number
    incoming: boolean
    state: string
    transferPercent: number
  }) => {
    chatStore.upsertFile(file)
  }
  onFileProgress = (file: {
    id: string
    state: string
    transferPercent: number
  }) => {
    chatStore.upsertFile(file)
  }
  onFileFinished = (file: {
    id: string
    state: string
    transferPercent: number
  }) => {
    chatStore.upsertFile(file)
  }
}

export default new Api()

interface UserTalkerEvent {
  user: string
  talker: string
}
