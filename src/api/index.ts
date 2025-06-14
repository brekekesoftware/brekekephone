import { action } from 'mobx'

import type { Conference, PbxEvent, Session } from '../brekekejs'
import { successConnectCheckPeriod } from '../config'
import { authPBX } from '../stores/AuthPBX'
import { authSIP } from '../stores/AuthSIP'
import { getAuthStore, waitSip } from '../stores/authStore'
import { authUC } from '../stores/AuthUC'
import type { Call } from '../stores/Call'
import { getCallStore } from '../stores/callStore'
import { chatStore, FileEvent } from '../stores/chatStore'
import { contactStore, getPartyNameAsync } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { sipErrorEmitter } from '../stores/sipErrorEmitter'
import { userStore } from '../stores/userStore'
import { resetProcessedPn } from '../utils/PushNotification-parse'
import { toBoolean } from '../utils/string'
import { pbx } from './pbx'
import { sip } from './sip'
import { SyncPnToken } from './syncPnToken'
import { uc } from './uc'
import { updatePhoneAppli } from './updatePhoneIndex'

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
    pbx.on('park-started', this.onPBXUserParkStarted)
    pbx.on('park-stopped', this.onPBXUserParkStopped)
    pbx.on('call-recording', this.onPbxCallRecording)
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
    console.log('PBX PN debug: set pbxState success')
    const s = getAuthStore()
    s.pbxState = 'success'
    s.pbxTotalFailure = 0

    authSIP.auth()
    await waitSip()

    await pbx.getConfig()
    const ca = s.getCurrentAccount()
    if (!ca) {
      return
    }

    if (!getAuthStore().userExtensionProperties) {
      updatePhoneAppli()
    }

    // handle pending request when pbx start
    pbx.retryRequests()

    // when pbx reconnects due to timeout, we wait for successConnectCheckPeriod before
    // attempting to syncPnToken, getPbxConfig, and getPbxUsers again
    const now = Date.now()
    console.log(
      `PBX PN debug: onPBXConnectionStarted pbxConnectedAt=${s.pbxConnectedAt} ,
      now=${now} successConnectCheckPeriod=${successConnectCheckPeriod} ,
      now - s.pbxConnectedAt=${now - s.pbxConnectedAt} ms`,
    )
    if (
      s.pbxConnectedAt &&
      now - s.pbxConnectedAt < successConnectCheckPeriod
    ) {
      console.log(
        'PBX PN debug: onPBXConnectionStarted try to skip syncPnToken, getPbxConfig, getPbxUsers',
      )
      return
    }

    contactStore.loadContacts()
    // load list local  when pbx start
    // set default pbxLocalAllUsers = true
    if (ca.pbxLocalAllUsers === undefined) {
      ca.pbxLocalAllUsers = true
    }
    if (s.isBigMode() || !ca.pbxLocalAllUsers) {
      if (ca.ucEnabled) {
        userStore.loadUcBuddyList()
      } else {
        userStore.loadPbxBuddyList()
      }
    } else {
      contactStore.getPbxUsers()
    }
    if (s.isSignInByNotification) {
      return
    }
    if (s.pbxLoginFromAnotherPlace) {
      console.log(
        'pbxLoginFromAnotherPlace debug: stop sync pn token when pbx login from another place',
      )
      return
    }
    SyncPnToken()
      .sync(ca)
      .then(() => SyncPnToken().syncForAllAccounts())

    s.pbxConnectedAt = Date.now()
  }
  onPBXConnectionStopped = () => {
    getAuthStore().pbxState = 'stopped'
    getAuthStore().pbxTotalFailure += 1
    getAuthStore().pbxConnectedAt = 0
  }
  onPBXConnectionTimeout = () => {
    getAuthStore().pbxState = 'failure'
    getAuthStore().pbxTotalFailure += 1
    getAuthStore().pbxConnectedAt = 0
    authPBX.auth()
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
    getCallStore().setNewVoicemailCount(ev?.new || 0)
  }
  onPBXUserParkStarted = (parkNumber: string) => {
    console.log('onPBXUserParkStarted', parkNumber)
    getCallStore().addParkNumber(parkNumber)
  }
  onPBXUserParkStopped = (parkNumber: string) => {
    console.log('onPBXUserParkStopped', parkNumber)
    getCallStore().removeParkNumber(parkNumber)
  }
  onPbxCallRecording = (ev: PbxEvent['callRecording']) => {
    getCallStore()
      .calls.find(item => item.pbxTalkerId === ev.talker_id)
      ?.updateRecordingStatus(toBoolean(ev.status))
  }
  @action onSIPConnectionStarted = () => {
    console.log('SIP PN debug: set sipState success')
    sipErrorEmitter.removeAllListeners()
    const s = getAuthStore()
    s.sipState = 'success'
    s.sipTotalFailure = 0
    authPBX.auth()
  }
  onSIPConnectionStopped = (e: { reason: string; response: string }) => {
    const s = getAuthStore()
    console.log('SIP PN debug: set sipState failure stopped')
    resetProcessedPn()
    s.sipState = 'failure'
    s.sipTotalFailure += 1
    if (s.sipTotalFailure > 3) {
      s.sipPn = {}
    }
    if (s.sipState === 'failure') {
      authSIP.auth()
    }
  }
  onSIPConnectionTimeout = () => {
    console.log('SIP PN debug: set sipState failure timeout')
    getAuthStore().sipState = 'failure'
    getAuthStore().sipTotalFailure += 1
    sip.stopWebRTC()
    authSIP.auth()
  }
  onSIPSessionStarted = async (c: Call) => {
    if (c.partyNumber === '8') {
      c.partyName = intl`Voicemail`
    }
    if (!c.partyName) {
      c.partyName = (await getPartyNameAsync(c.partyNumber)) || c.partyNumber
    }
    getCallStore().onCallUpsert(c)
  }
  onSIPSessionUpdated = (call: Call) => {
    getCallStore().onCallUpsert(call)
  }
  onSIPSessionStopped = (rawSession: Session) => {
    getCallStore().onCallRemove(rawSession)
  }

  onUCConnectionStopped = () => {
    getAuthStore().ucState = 'stopped'
  }
  onUCConnectionTimeout = () => {
    getAuthStore().ucState = 'failure'
    getAuthStore().ucTotalFailure += 1
    authUC.auth()
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
