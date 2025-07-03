import { action } from 'mobx'

import { updatePhoneAppli } from '#/api/updatePhoneIndex'
import type { Conference, PbxEvent, Session } from '#/brekekejs'
import { successConnectCheckPeriod } from '#/config'
import type { Call } from '#/stores/Call'
import { FileEvent } from '#/stores/chatStore'
import { getPartyNameAsync } from '#/stores/contactStore'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { sipErrorEmitter } from '#/stores/sipErrorEmitter'
import { resetProcessedPn } from '#/utils/PushNotification-parse'
import { toBoolean } from '#/utils/string'

class Api {
  constructor() {
    ctx.pbx.on('connection-started', this.onPBXConnectionStarted)
    ctx.pbx.on('connection-stopped', this.onPBXConnectionStopped)
    ctx.pbx.on('connection-timeout', this.onPBXConnectionTimeout)
    ctx.pbx.on('user-calling', this.onPBXUserCalling)
    ctx.pbx.on('user-ringing', this.onPBXUserRinging)
    ctx.pbx.on('user-talking', this.onPBXUserTalking)
    ctx.pbx.on('user-holding', this.onPBXUserHolding)
    ctx.pbx.on('user-hanging', this.onPBXUserHanging)
    ctx.pbx.on('voicemail-updated', this.onVoiceMailUpdated)
    ctx.pbx.on('park-started', this.onPBXUserParkStarted)
    ctx.pbx.on('park-stopped', this.onPBXUserParkStopped)
    ctx.pbx.on('call-recording', this.onPbxCallRecording)
    ctx.sip.on('connection-started', this.onSIPConnectionStarted)
    ctx.sip.on('connection-stopped', this.onSIPConnectionStopped)
    ctx.sip.on('connection-timeout', this.onSIPConnectionTimeout)
    ctx.sip.on('session-started', this.onSIPSessionStarted)
    ctx.sip.on('session-updated', this.onSIPSessionUpdated)
    ctx.sip.on('session-stopped', this.onSIPSessionStopped)
    ctx.uc.on('connection-stopped', this.onUCConnectionStopped)
    ctx.uc.on('user-updated', this.onUCUserUpdated)
    ctx.uc.on('buddy-chat-created', this.onBuddyChatCreated)
    ctx.uc.on('group-chat-created', this.onGroupChatCreated)
    ctx.uc.on('chat-group-invited', this.onChatGroupInvited)
    ctx.uc.on('chat-group-revoked', this.onChatGroupRevoked)
    ctx.uc.on('chat-group-updated', this.onChatGroupUpdated)
    ctx.uc.on('file-received', this.onFileReceived)
    ctx.uc.on('file-progress', this.onFileProgress)
    ctx.uc.on('file-finished', this.onFileFinished)
  }

  @action onPBXConnectionStarted = async () => {
    console.log('PBX PN debug: set pbxState success')
    ctx.auth.pbxState = 'success'
    ctx.auth.pbxTotalFailure = 0

    ctx.authSIP.auth()
    await ctx.auth.waitSip()

    await ctx.pbx.getConfig()
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return
    }

    if (!ctx.auth.userExtensionProperties) {
      updatePhoneAppli()
    }

    // handle pending request when pbx start
    ctx.pbx.retryRequests()

    // when pbx reconnects due to timeout, we wait for successConnectCheckPeriod before
    // attempting to syncPnToken, getPbxConfig, and getPbxUsers again
    const now = Date.now()
    console.log(
      `PBX PN debug: onPBXConnectionStarted pbxConnectedAt=${ctx.auth.pbxConnectedAt} ,
      now=${now} successConnectCheckPeriod=${successConnectCheckPeriod} ,
      now - s.pbxConnectedAt=${now - ctx.auth.pbxConnectedAt} ms`,
    )
    if (
      ctx.auth.pbxConnectedAt &&
      now - ctx.auth.pbxConnectedAt < successConnectCheckPeriod
    ) {
      console.log(
        'PBX PN debug: onPBXConnectionStarted try to skip syncPnToken, getPbxConfig, getPbxUsers',
      )
      return
    }

    ctx.contact.loadContacts()
    // load list local  when pbx start
    // set default pbxLocalAllUsers = true
    if (ca.pbxLocalAllUsers === undefined) {
      ca.pbxLocalAllUsers = true
    }
    if (ctx.auth.isBigMode() || !ca.pbxLocalAllUsers) {
      if (ca.ucEnabled) {
        ctx.user.loadUcBuddyList()
      } else {
        ctx.user.loadPbxBuddyList()
      }
    } else {
      ctx.contact.getPbxUsers()
    }
    if (ctx.auth.isSignInByNotification) {
      return
    }
    if (ctx.auth.pbxLoginFromAnotherPlace) {
      console.log(
        'pbxLoginFromAnotherPlace debug: stop sync pn token when pbx login from another place',
      )
      return
    }
    ctx.pnToken.sync(ca).then(() => ctx.pnToken.syncForAllAccounts())

    ctx.auth.pbxConnectedAt = Date.now()
  }
  onPBXConnectionStopped = () => {
    ctx.auth.pbxState = 'stopped'
    ctx.auth.pbxTotalFailure += 1
    ctx.auth.pbxConnectedAt = 0
  }
  onPBXConnectionTimeout = () => {
    ctx.auth.pbxState = 'failure'
    ctx.auth.pbxTotalFailure += 1
    ctx.auth.pbxConnectedAt = 0
    ctx.authPBX.auth()
  }
  onPBXUserCalling = (ev: UserTalkerEvent) => {
    ctx.contact.setTalkerStatus(ev.user, ev.talker, 'calling')
  }
  onPBXUserRinging = (ev: UserTalkerEvent) => {
    ctx.contact.setTalkerStatus(ev.user, ev.talker, 'ringing')
  }
  onPBXUserTalking = (ev: UserTalkerEvent) => {
    ctx.contact.setTalkerStatus(ev.user, ev.talker, 'talking')
  }
  onPBXUserHolding = (ev: UserTalkerEvent) => {
    ctx.contact.setTalkerStatus(ev.user, ev.talker, 'holding')
  }
  onPBXUserHanging = (ev: UserTalkerEvent) => {
    ctx.contact.setTalkerStatus(ev.user, ev.talker, '')
  }
  onVoiceMailUpdated = (ev: { new: number }) => {
    ctx.call.setNewVoicemailCount(ev?.new || 0)
  }
  onPBXUserParkStarted = (parkNumber: string) => {
    console.log('onPBXUserParkStarted', parkNumber)
    ctx.call.addParkNumber(parkNumber)
  }
  onPBXUserParkStopped = (parkNumber: string) => {
    console.log('onPBXUserParkStopped', parkNumber)
    ctx.call.removeParkNumber(parkNumber)
  }
  onPbxCallRecording = (ev: PbxEvent['callRecording']) => {
    ctx.call.calls
      .find(item => item.pbxTalkerId === ev.talker_id)
      ?.updateRecordingStatus(toBoolean(ev.status))
  }
  @action onSIPConnectionStarted = () => {
    console.log('SIP PN debug: set sipState success')
    sipErrorEmitter.removeAllListeners()
    ctx.auth.sipState = 'success'
    ctx.auth.sipTotalFailure = 0
    ctx.authPBX.auth()
  }
  onSIPConnectionStopped = (e: { reason: string; response: string }) => {
    console.log('SIP PN debug: set sipState failure stopped')
    resetProcessedPn()
    ctx.auth.sipState = 'failure'
    ctx.auth.sipTotalFailure += 1
    if (ctx.auth.sipTotalFailure > 3) {
      ctx.auth.sipPn = {}
    }
    if (ctx.auth.sipState === 'failure') {
      ctx.authSIP.auth()
    }
  }
  onSIPConnectionTimeout = () => {
    console.log('SIP PN debug: set sipState failure timeout')
    ctx.auth.sipState = 'failure'
    ctx.auth.sipTotalFailure += 1
    ctx.sip.stopWebRTC()
    ctx.authSIP.auth()
  }
  onSIPSessionStarted = async (c: Call) => {
    if (c.partyNumber === '8') {
      c.partyName = intl`Voicemail`
    }
    if (!c.partyName) {
      c.partyName = (await getPartyNameAsync(c.partyNumber)) || c.partyNumber
    }
    ctx.call.onCallUpsert(c)
  }
  onSIPSessionUpdated = (call: Call) => {
    ctx.call.onCallUpsert(call)
  }
  onSIPSessionStopped = (rawSession: Session) => {
    ctx.call.onCallRemove(rawSession)
  }

  onUCConnectionStopped = () => {
    ctx.auth.ucState = 'stopped'
  }
  onUCConnectionTimeout = () => {
    ctx.auth.ucState = 'failure'
    ctx.auth.ucTotalFailure += 1
    ctx.authUC.auth()
  }
  onUCUserUpdated = (ev: {
    id: string
    name: string
    avatar: string
    status: string
    statusText: string
  }) => {
    ctx.contact.updateUcUser(ev)
    ctx.user.updateStatusBuddy(ev.id, ev.status, ev.avatar)
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
    ctx.chat.pushMessages(chat.creator, chat, true)
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
    ctx.chat.pushMessages(chat.group, chat, true)
  }

  onChatGroupInvited = (group: {
    id: string
    name: string
    inviter: string
    members: string[]
    webchat: Conference
  }) => {
    ctx.chat.upsertGroup(group)
  }
  onChatGroupUpdated = (group: {
    id: string
    name: string
    jointed: boolean
    members: string[]
    webchat: Conference
  }) => {
    ctx.chat.upsertGroup(group)
  }
  onChatGroupRevoked = (group: { id: string }) => {
    ctx.chat.removeGroup(group.id)
  }
  onFileReceived = (file: {
    id: string
    name: string
    size: number
    incoming: boolean
    state: string
    transferPercent: number
  }) => {
    ctx.chat.upsertFile(file)
  }
  onFileProgress = (file: {
    id: string
    state: string
    transferPercent: number
  }) => {
    ctx.chat.upsertFile(file, FileEvent.onFileProgress)
  }
  onFileFinished = (file: {
    id: string
    state: string
    transferPercent: number
  }) => {
    ctx.chat.upsertFile(file)
  }
}

new Api()

interface UserTalkerEvent {
  user: string
  talker: string
}
