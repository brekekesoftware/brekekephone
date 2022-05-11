import { action } from 'mobx'

import { authPBX } from '../stores/AuthPBX'
import { getAuthStore, waitSip } from '../stores/authStore'
import { Call } from '../stores/Call'
import { callStore } from '../stores/callStore'
import { chatStore, FileEvent } from '../stores/chatStore'
import { contactStore, getPartyName } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { sipErrorEmitter } from '../stores/sipErrorEmitter'
import { userStore } from '../stores/userStore'
import { Conference } from './brekekejs'
import { pbx } from './pbx'
import { sip } from './sip'
import { SyncPnToken } from './syncPnToken'
import { uc } from './uc'

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

  @action onPBXConnectionStarted = async () => {
    console.error('PBX PN debug: set pbxState success')
    const s = getAuthStore()
    s.pbxState = 'success'
    await waitSip()
    await pbx.getConfig()
    const cp = s.currentProfile
    if (!cp) {
      return
    }
    // load list local  when pbx start
    // set default pbxLocalAllUsers = true
    if (cp.pbxLocalAllUsers === undefined) {
      cp.pbxLocalAllUsers = true
    }
    if (s.isBigMode || !cp.pbxLocalAllUsers) {
      cp.ucEnabled ? userStore.loadUcBuddyList() : userStore.loadPbxBuddyList()
    } else {
      contactStore.getPbxUsers()
    }

    if (s.isSignInByNotification) {
      return
    }
    SyncPnToken()
      .sync(cp)
      .then(() => SyncPnToken().syncForAllAccounts())
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
    callStore.setNewVoicemailCount(ev?.new || 0)
  }

  @action onSIPConnectionStarted = () => {
    console.error('SIP PN debug: set sipState success')
    sipErrorEmitter.removeAllListeners()
    const s = getAuthStore()
    s.sipPn.sipAuth = ''
    s.sipState = 'success'
    authPBX.auth()
  }
  onSIPConnectionStopped = (e: { reason: string; response: string }) => {
    const s = getAuthStore()
    if (!e?.reason && !e?.response) {
      console.error('SIP PN debug: set sipState stopped')
      getAuthStore().sipState = 'stopped'
    } else {
      console.error('SIP PN debug: set sipState failure stopped')
      s.sipState = 'failure'
      s.sipTotalFailure += 1
    }
  }
  onSIPConnectionTimeout = () => {
    console.error('SIP PN debug: set sipState failure timeout')
    getAuthStore().sipState = 'failure'
    getAuthStore().sipTotalFailure += 1
    sip.stopWebRTC()
  }
  onSIPSessionStarted = (c: Call) => {
    if (c.partyNumber === '8') {
      c.partyName = intl`Voicemail`
    }
    if (!c.partyName) {
      c.partyName = getPartyName(c.partyNumber) || c.partyNumber
    }
    callStore.onCallUpsert(c)
  }
  onSIPSessionUpdated = (call: Call) => {
    callStore.onCallUpsert(call)
  }
  onSIPSessionStopped = (id: string) => {
    callStore.onCallRemove(id)
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
    contactStore.updateUcUser(ev)
    userStore.updateStatusBuddy(ev.id, ev.status, ev.avatar)
  }
  onBuddyChatCreated = (chat: {
    id: string
    creator: string
    text?: string
    type: number
    file?: string
    created: number
    conf_id: string
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
    webchat: Conference
  }) => {
    chatStore.upsertGroup(group)
  }
  onChatGroupUpdated = (group: {
    id: string
    name: string
    jointed: boolean
    members: string[]
    webchat: Conference
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
    chatStore.upsertFile(file, FileEvent.onFileProgress)
  }
  onFileFinished = (file: {
    id: string
    state: string
    transferPercent: number
  }) => {
    chatStore.upsertFile(file)
  }
}

new Api()

interface UserTalkerEvent {
  user: string
  talker: string
}
