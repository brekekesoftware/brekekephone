import { debounce } from 'lodash'
import { action, observable, runInAction } from 'mobx'
import { AppState, Platform } from 'react-native'
import RNCallKeep, { CONSTANTS } from 'react-native-callkeep'
import IncallManager from 'react-native-incall-manager'
import { v4 as newUuid } from 'uuid'

import { MakeCallFn, Session } from '../api/brekekejs'
import { pbx } from '../api/pbx'
import { checkAndRemovePnTokenViaSip, sip } from '../api/sip'
import { uc } from '../api/uc'
import { embedApi } from '../embed/embedApi'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { TEvent } from '../utils/callkeep'
import { ParsedPn } from '../utils/PushNotification-parse'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { arrToMap } from '../utils/toMap'
import { webShowNotification } from '../utils/webShowNotification'
import { accountStore } from './accountStore'
import { addCallHistory } from './addCallHistory'
import { authSIP } from './AuthSIP'
import { getAuthStore, reconnectAndWaitSip } from './authStore'
import { Call } from './Call'
import { setCallStore } from './callStore'
import { CancelRecentPn } from './cancelRecentPn'
import { intl, intlDebug } from './intl'
import { Nav } from './Nav'
import { RnAlert } from './RnAlert'
import { RnAppState } from './RnAppState'
import { RnStacker } from './RnStacker'
import { timerStore } from './timerStore'

export class CallStore {
  @observable inPageCallManage?: {
    isFromCallBar?: boolean
  } = undefined

  private recentCallActivityAt = 0

  private getCallkeep = (
    uuid: string,
    o?: {
      includingOutgoing?: boolean
      includingAnswered?: boolean
      includingRejected?: boolean
    },
  ) => {
    const pnId = this.getPnIdFromUuid(uuid)
    return this.calls.find(
      c =>
        (!pnId || c.pnId === pnId) &&
        (!c.callkeepUuid || c.callkeepUuid === uuid) &&
        (o?.includingOutgoing || c.incoming) &&
        (o?.includingAnswered || (!c.answered && !c.callkeepAlreadyAnswered)) &&
        (o?.includingRejected || !c.callkeepAlreadyRejected) &&
        !c.isAboutToHangup,
    )
  }

  private autoAnswer = (uuid: string) => {
    if (Platform.OS === 'ios') {
      RNCallKeep.answerIncomingCall(uuid)
    }
    BrekekeUtils.onCallKeepAction(uuid, 'answerCall')
  }
  @action onCallKeepDidDisplayIncomingCall = async (
    uuid: string,
    n: ParsedPn,
  ) => {
    if (n.sipPn.autoAnswer && !this.calls.some(c => c.callkeepUuid !== uuid)) {
      if (RnAppState.foregroundOnce && RnAppState.currentState !== 'active') {
        RNCallKeep.backToForeground()
      }
      BackgroundTimer.setTimeout(() => this.autoAnswer(uuid), 2000)
    }
    this.setAutoEndCallKeepTimer(uuid, n)
    checkAndRemovePnTokenViaSip(n)
    // Find the current incoming call which is not callkeep
    // Assign the data and config
    const c = this.getCallkeep(uuid)
    if (c) {
      c.callkeepUuid = uuid
      BrekekeUtils.setCallConfig(uuid, JSON.stringify(c.callConfig))
    }
    // Check if call is rejected already
    const rejected = this.isCallRejected({
      callkeepUuid: uuid,
      pnId: n.id,
    })
    // Check if call is expired already
    let expired = false
    const d = await accountStore.findDataByPn(n)
    const pnExpires = Number(d?.pnExpires) || 50000 // default to 50s
    const now = Date.now()
    if (n.time) {
      expired = now > n.time + pnExpires
    }
    console.log(
      `SIP PN debug: onCallKeepDidDisplayIncomingCall uuid=${uuid} pnId=${n.id} sessionId=${c?.id} rejected=${rejected} now=${now} n.time=${n.time} pnExpires=${pnExpires} expired=${expired}`,
    )
    if (rejected || expired) {
      this.endCallKeep(uuid)
      return
    }
    // Auto reconnect if no activity
    // This logic is about the case connection has dropped silently
    // So even if sipState is `success` but the connection has dropped
    // We just drop the connection no matter if it is alive or not
    // Then construct a new connection to receive the call as quickly as possible
    if (now - this.recentCallActivityAt > 3000) {
      const as = getAuthStore()
      if (as.sipState === 'connecting') {
        return
      }
      const count = sip.phone?.getSessionCount()
      if (!count) {
        console.log(
          `SIP PN debug: new notification: phone.getSessionCount()=${count} | call destroyWebRTC()`,
        )
        as.sipState = 'stopped'
        sip.destroyWebRTC()
        authSIP.authWithCheck()
      }
    }
  }
  @action onCallKeepAnswerCall = (uuid: string) => {
    this.setCallkeepAction({ callkeepUuid: uuid }, 'answerCall')
    const c = this.getCallkeep(uuid)
    console.log(`SIP PN debug: onCallKeepAnswerCall found: ${!!c}`)
    if (c && !c.callkeepAlreadyAnswered) {
      c.callkeepAlreadyAnswered = true
      c.answer()
    }
  }
  @action onCallKeepEndCall = (uuid: string) => {
    this.setCallkeepAction({ callkeepUuid: uuid }, 'rejectCall')
    const c = this.getCallkeep(uuid, {
      includingAnswered: true,
      includingRejected: Platform.OS === 'android',
      includingOutgoing: Platform.OS === 'ios',
    })
    console.log(`SIP PN debug: onCallKeepEndCall found: ${!!c}`)
    if (c) {
      c.callkeepAlreadyRejected = true
      c.hangupWithUnhold()
    }
    this.endCallKeep(uuid)
  }

  @observable calls: Call[] = []
  @observable currentCallId: string = ''

  getCurrentCall = () => {
    this.updateCurrentCallDebounce()
    const curr = this.calls.find(c => c.id === this.currentCallId)
    // TODO:
    // Should not modify state in getter
    // This will throw an error in mobx-react
    // Currently we forked mobx-react to temporary get over this error
    // In the future we need to rewrite and refactor the whole stores/actions
    if (curr) {
      const ucEnabled = getAuthStore()?.getCurrentAccount()?.ucEnabled
      if (
        !curr.answered &&
        (!curr.partyImageUrl || !curr.partyImageUrl?.length)
      ) {
        curr.partyImageUrl = ucEnabled
          ? this.getOriginalUserImageUrl(curr.pbxTenant, curr.partyNumber)
          : ''
        curr.partyImageSize = ucEnabled ? 'large' : ''
      }
      if (
        curr.answered &&
        (!curr.talkingImageUrl || !curr.talkingImageUrl.length)
      ) {
        curr.talkingImageUrl = ucEnabled
          ? this.getOriginalUserImageUrl(curr.pbxTenant, curr.partyNumber)
          : ''
      }
    }
    return curr
  }

  @action updateCallAvatar = (url: string, size?: string) => {
    const c = this.getCurrentCall()
    if (c) {
      c.partyImageUrl = url
      c.partyImageSize = size || 'small'
    }
  }

  private getOriginalUserImageUrl = (tenant: string, name: string): string => {
    if (!tenant || !name) {
      return ''
    }
    const a = getAuthStore().getCurrentAccount()
    if (!a) {
      return ''
    }
    const { pbxHostname, pbxPort } = a
    let ucHost = `${pbxHostname}:${pbxPort}`
    if (ucHost.indexOf(':') < 0) {
      ucHost += ':443'
    }
    const ucScheme = ucHost.endsWith(':80') ? 'http' : 'https'
    const baseUrl = `${ucScheme}://${ucHost}`
    return `${baseUrl}/uc/image?ACTION=DOWNLOAD&tenant=${tenant}&user=${name}&SIZE=ORIGINAL`
  }

  private incallManagerStarted = false
  onCallUpsert: CallStore['upsertCall'] = c => {
    this.upsertCall(c)
    if (
      Platform.OS === 'android' &&
      !this.incallManagerStarted &&
      this.calls.find(_ => _.answered || !_.incoming)
    ) {
      this.incallManagerStarted = true
      IncallManager.start()
      IncallManager.setForceSpeakerphoneOn(false)
    }
  }
  onForceUpdateSpeaker = () => {
    BackgroundTimer.setTimeout(() => {
      IncallManager.setForceSpeakerphoneOn(this.isLoudSpeakerEnabled)
    }, 2000)
  }
  @action private upsertCall = (
    // partial
    p: Pick<Call, 'id'> & Partial<Omit<Call, 'id'>>,
  ) => {
    this.updateCurrentCallDebounce()
    const now = Date.now()
    this.recentCallActivityAt = now
    //
    // existing
    const e = this.calls.find(c => c.id === p.id)
    if (e) {
      if (p.callConfig) {
        // Merge new config with current config instead of replacing
        Object.assign(e.callConfig, p.callConfig)
      }
      delete p.callConfig
      if (e.callkeepUuid) {
        BrekekeUtils.setCallConfig(e.callkeepUuid, JSON.stringify(e.callConfig))
      }
      if (p.rawSession && e.rawSession) {
        Object.assign(e.rawSession, p.rawSession)
        delete p.rawSession
      }
      if (
        p.videoSessionId &&
        e.videoSessionId &&
        p.videoSessionId !== e.videoSessionId &&
        !p.remoteVideoEnabled
      ) {
        delete p.videoSessionId
        delete p.remoteVideoEnabled
        delete p.remoteVideoStreamObject
      }
      if (!e.answered && p.answered) {
        this.currentCallId = e.id
        e.answerCallKeep()
        p.answeredAt = now
        BrekekeUtils.onCallConnected(e.callkeepUuid)
        // TODO hacky way to fix no audio/voice
        if (Platform.OS === 'ios') {
          this.onForceUpdateSpeaker()
        }
      }
      Object.assign(e, p, {
        withSDPControls: e.withSDPControls || p.withSDP,
      })
      if (e.incoming && e.callkeepUuid) {
        BrekekeUtils.setRemoteVideoStreamURL(
          e.callkeepUuid,
          e.remoteVideoStreamObject ? e.remoteVideoStreamObject.toURL() : '',
        )
      }
      if (e.talkingImageUrl && e.talkingImageUrl.length > 0) {
        BrekekeUtils.setTalkingAvatar(
          e.callkeepUuid,
          e.talkingImageUrl,
          e.partyImageSize === 'large',
        )
      }
      if (
        e.incoming &&
        e.callkeepUuid &&
        typeof e.localVideoEnabled === 'boolean'
      ) {
        BrekekeUtils.setIsVideoCall(e.callkeepUuid, !!e.localVideoEnabled)
      }
      embedApi.emit('call_update', e)
      return
    }
    //
    // Construct a new call
    const c = new Call(this)
    Object.assign(c, p)
    this.calls = [c, ...this.calls]
    // Update java and embed api
    BrekekeUtils.setJsCallsSize(this.calls.length)
    embedApi.emit('call', c)
    // Desktop notification
    if (Platform.OS === 'web' && c.incoming && !c.answered) {
      webShowNotification(
        c.getDisplayName() + ' ' + intl`Incoming call`,
        c.getDisplayName(),
      )
    }
    // Get and check callkeep if pending incoming call
    if (Platform.OS === 'web' || !c.incoming || c.answered) {
      return
    }
    c.callkeepUuid = c.callkeepUuid || this.getUuidFromPnId(c.pnId) || ''
    const callkeepAction = this.getCallkeepAction(c)
    console.log(
      `PN ID debug: upsertCall pnId=${c.pnId} callkeepUuid=${c.callkeepUuid} callkeepAction=${callkeepAction}`,
    )
    if (callkeepAction === 'answerCall') {
      c.callkeepAlreadyAnswered = true
      c.answer()
      console.log('SIP PN debug: answer by recentPnAction')
    } else if (callkeepAction === 'rejectCall') {
      c.callkeepAlreadyRejected = true
      c.hangupWithUnhold()
      console.log('SIP PN debug: reject by recentPnAction')
    }
  }

  @action onCallRemove = (rawSession: Session) => {
    this.updateCurrentCallDebounce()
    this.recentCallActivityAt = Date.now()
    const c = this.calls.find(_ => _.id === rawSession.sessionId)
    if (!c) {
      return
    }
    if (c.rawSession) {
      Object.assign(c.rawSession, rawSession)
    } else {
      c.rawSession = rawSession
    }
    this.onSipUaCancel({ pnId: c.pnId })
    c.callkeepUuid && this.endCallKeep(c.callkeepUuid)
    c.callkeepUuid = ''
    c.callkeepAlreadyRejected = true
    addCallHistory(c)
    this.calls = this.calls.filter(c0 => c0 !== c)
    // Set number of total calls in our custom java incoming call module
    BrekekeUtils.setJsCallsSize(this.calls.length)
    // When if this is a outgoing call, try to insert a call history to uc chat
    if (getAuthStore().ucState === 'success' && c.answeredAt && !c.incoming) {
      uc.sendCallResult(c.getDuration(), c.partyNumber)
    }
    // Turn off loud speaker if there's no call left
    if (Platform.OS !== 'web' && !this.calls.length) {
      this.isLoudSpeakerEnabled = false
      IncallManager.setForceSpeakerphoneOn(false)
    }
    // Stop android incall manager if there's no call left
    if (
      Platform.OS === 'android' &&
      this.incallManagerStarted &&
      !this.calls.length
    ) {
      this.incallManagerStarted = false
      IncallManager.stop()
    }
    embedApi.emit('call_end', c)
  }

  @action onSelectBackgroundCall = (c: Immutable<Call>) => {
    if (c.holding) {
      c.toggleHoldWithCheck()
    }
    this.currentCallId = c.id
    Nav().backToPageCallManage()
  }

  private startCallIntervalAt = 0
  private startCallIntervalId = 0
  private clearStartCallIntervalTimer = () => {
    if (this.startCallIntervalId) {
      BackgroundTimer.clearInterval(this.startCallIntervalId)
      this.startCallIntervalId = 0
    }
  }
  startCall: MakeCallFn = (number: string, ...args) => {
    if (this.calls.filter(c => !c.incoming && !c.answered).length) {
      RnAlert.error({
        message: intlDebug`Only make one outgoing call`,
      })
      return
    }

    let reconnectCalled = false
    const sipCreateSession = () => sip.phone?.makeCall(number, ...args)
    try {
      // Try to call pbx first to see if there's any error with the network
      // TODO
      void pbx
      sipCreateSession()
    } catch (err) {
      reconnectCalled = true
      reconnectAndWaitSip().then(sipCreateSession)
    }
    Nav().goToPageCallManage()
    // Start call logic in RNCallKeep
    // Adding this will help the outgoing call automatically hold on GSM call
    let uuid = ''
    if (Platform.OS !== 'web') {
      uuid = newUuid().toUpperCase()
      Platform.OS === 'ios' &&
        RNCallKeep.startCall(uuid, number, 'Brekeke Phone')
      this.setAutoEndCallKeepTimer(uuid)
    }
    // Check for each 0.5s: auto update currentCallId
    // The call will be emitted from sip, we'll use interval here to set it
    runInAction(() => {
      this.currentCallId = ''
    })
    const prevIds = arrToMap(this.calls, 'id') as { [k: string]: boolean }
    // Also if after 3s there's no call in store, reconnect
    this.clearStartCallIntervalTimer()
    this.startCallIntervalAt = Date.now()
    this.startCallIntervalId = BackgroundTimer.setInterval(
      action(() => {
        const curr = this.calls.find(c => !c.incoming && !prevIds[c.id])
        if (curr) {
          if (uuid) {
            curr.callkeepUuid = uuid
          }
          this.currentCallId = curr.id
          this.clearStartCallIntervalTimer()
          return
        }
        const diff = Date.now() - this.startCallIntervalAt
        // Add a guard of 10s to clear the interval
        if (diff > 10000) {
          if (uuid) {
            this.endCallKeep(uuid)
          }
          this.clearStartCallIntervalTimer()
          return
        }
        // And if after 3s there's no call in store, reconnect
        // It's likely a connection issue occurred
        if (!curr && !reconnectCalled && diff > 3000) {
          reconnectCalled = true
          reconnectAndWaitSip().then(sipCreateSession)
          this.clearStartCallIntervalTimer()
        }
      }),
      500,
    )
  }
  startVideoCall = (number: string) => this.startCall(number, undefined, true)

  private updateBackgroundCalls = () => {
    // Auto hold background calls
    if (!this.currentCallId) {
      return
    }
    this.calls
      .filter(
        c =>
          c.id !== this.currentCallId &&
          c.answered &&
          !c.transferring &&
          !c.holding &&
          !c.isAboutToHangup,
      )
      .forEach(c => c.toggleHoldWithCheck())
  }
  private updateBackgroundCallsDebounce = debounce(
    this.updateBackgroundCalls,
    300,
    { maxWait: 1000 },
  )
  @action private updateCurrentCall = () => {
    const curr =
      this.calls.find(c => c.id === this.currentCallId) ||
      this.calls.find(c => c.answered && !c.holding && !c.isAboutToHangup) ||
      this.calls[0]
    this.currentCallId = curr?.id || ''
    if (!this.currentCallId) {
      const [s0, ...stacks] = RnStacker.stacks
      if (stacks.some(s => s.name.startsWith('PageCall'))) {
        RnStacker.stacks = [s0]
      }
    }
    this.updateBackgroundCallsDebounce()
  }
  private updateCurrentCallDebounce = debounce(this.updateCurrentCall, 300, {
    maxWait: 1000,
  })

  // CallKeep + PN data
  @observable callkeepMap: {
    [uuid: string]: {
      uuid: string
      at: number
      incomingPnData?: ParsedPn
      hasAction?: boolean
    }
  } = {}
  getUuidFromPnId = (pnId: string) =>
    Object.values(this.callkeepMap)
      .map(c => c.incomingPnData)
      .find(d => d?.id === pnId)?.callkeepUuid
  getPnIdFromUuid = (uuid: string) => this.callkeepMap[uuid]?.incomingPnData?.id

  // Logic to end call if timeout of 20s
  private autoEndCallKeepTimerId = 0
  private clearAutoEndCallKeepTimer = () => {
    if (Platform.OS === 'web' || !this.autoEndCallKeepTimerId) {
      return
    }
    BackgroundTimer.clearInterval(this.autoEndCallKeepTimerId)
    this.autoEndCallKeepTimerId = 0
  }
  @action private setAutoEndCallKeepTimer = (
    uuid: string,
    incomingPnData?: ParsedPn,
  ) => {
    if (Platform.OS === 'web') {
      return
    }
    if (incomingPnData) {
      incomingPnData.callkeepUuid = uuid
    }
    this.callkeepMap[uuid] = {
      uuid,
      at: Date.now(),
      incomingPnData,
    }
    this.clearAutoEndCallKeepTimer()
    this.autoEndCallKeepTimerId = BackgroundTimer.setInterval(() => {
      const n = Date.now()
      Object.values(this.callkeepMap).forEach(k => {
        if (n - k.at > 20000) {
          const c = this.calls.find(_ => _.callkeepUuid === k.uuid)
          if (!c) {
            this.endCallKeep(k.uuid)
          }
        }
      })
      if (!Object.keys(this.callkeepMap).length) {
        this.clearAutoEndCallKeepTimer()
      }
    }, 500)
  }
  @action private endCallKeep = (
    uuid: string,
    {
      setAction = true,
      completedElseWhere,
    }: {
      setAction?: boolean
      completedElseWhere?: boolean
    } = {},
  ) => {
    if (!uuid) {
      return
    }
    console.log('PN callkeep debug: endCallKeep ' + uuid)
    if (setAction) {
      this.setCallkeepAction({ callkeepUuid: uuid }, 'rejectCall')
    }
    const pnData = this.callkeepMap[uuid]?.incomingPnData
    if (
      pnData &&
      !this.calls.some(c => c.callkeepUuid === uuid || c.pnId === pnData.id) &&
      !completedElseWhere
    ) {
      addCallHistory(pnData)
    }
    delete this.callkeepMap[uuid]
    RNCallKeep.rejectCall(uuid)
    RNCallKeep.endCall(uuid)
    RNCallKeep.reportEndCallWithUUID(
      uuid,
      CONSTANTS.END_CALL_REASONS.REMOTE_ENDED,
    )
    BrekekeUtils.closeIncomingCall(uuid)
  }
  endCallKeepAllCalls = () => {
    if (Platform.OS !== 'web') {
      RNCallKeep.endAllCalls()
    }
    BrekekeUtils.closeAllIncomingCalls()
    this.onCallKeepAction()
  }
  @action onCallKeepAction = () => {
    this.calls
      .map(c => this.callkeepMap[c.callkeepUuid])
      .filter(c => c)
      .forEach(c => {
        c.hasAction = true
      })
  }

  // Move from callkeep.ts to avoid circular dependencies
  // Logic to show incoming call ui in case of already have a running call in RNCallKeep android
  private alreadyShowIncomingCallUi: { [k: string]: boolean } = {}
  showIncomingCallUi = (e: TEvent & { pnData: ParsedPn }) => {
    const uuid = e.callUUID.toUpperCase()
    if (this.alreadyShowIncomingCallUi[uuid]) {
      console.log('SIP PN debug: showIncomingCallUi: already show this uuid')
      return
    }
    this.alreadyShowIncomingCallUi[uuid] = true
    if (this.isCallRejected({ callkeepUuid: uuid, pnId: e.pnData.id })) {
      console.log(
        'SIP PN debug: showIncomingCallUi: call already rejected on js side',
      )
      this.endCallKeep(uuid)
      return
    }
    this.onCallKeepDidDisplayIncomingCall(uuid, e.pnData)
  }

  // Actions map in case of call is not available at the time receive the action
  // This map wont be deleted if the callkeep end
  @observable callkeepActionMap: {
    [uuidOrPnId: string]: TCallkeepAction
  } = {}
  private setCallkeepAction = (c: TCallkeepIds, a: TCallkeepAction) => {
    if (c.callkeepUuid) {
      c.pnId = this.getPnIdFromUuid(c.callkeepUuid)
    } else if (c.pnId) {
      c.callkeepUuid = this.getUuidFromPnId(c.pnId)
    }
    if (c.callkeepUuid) {
      this.callkeepActionMap[c.callkeepUuid] = a
    }
    if (c.pnId) {
      this.callkeepActionMap[c.pnId] = a
    }
    this.onCallKeepAction()
  }
  private getCallkeepAction = (c: TCallkeepIds) =>
    (c.callkeepUuid && this.callkeepActionMap[c.callkeepUuid]) ||
    (c.pnId && this.callkeepActionMap[c.pnId])
  isCallRejected = (c?: TCallkeepIds) =>
    c && this.getCallkeepAction(c) === 'rejectCall'

  getCallInNotify = () => {
    // Do not display our callbar if already show callkeep
    return this.calls.find(_ => {
      const k = this.callkeepMap[_.callkeepUuid]
      return (
        _.incoming &&
        !_.answered &&
        (!k ||
          k.hasAction ||
          // Trigger timerStore.now observer at last
          timerStore.now - _.createdAt > 1000)
      )
    })
  }
  shouldRingInNotify = (uuid?: string) => {
    // Disable ringtone when enable PN
    if (getAuthStore().getCurrentAccount()?.pushNotificationEnabled) {
      return false
    }

    if (Platform.OS === 'web' || !uuid) {
      return true
    }

    // Do not ring on background
    if (RnAppState.currentState !== 'active') {
      return false
    }
    // Do not ring if has an ongoing answered call
    if (this.calls.some(_ => _.answered)) {
      return false
    }
    // ios: Do not ring if has a callkeep with no action yet
    if (
      Platform.OS === 'ios' &&
      Object.keys(this.callkeepMap).some(
        _ => _ !== uuid && !this.callkeepActionMap[_],
      )
    ) {
      return false
    }

    return true
  }

  // To be used in sip.phone._ua.on('newNotify')
  onSipUaCancel = (n?: CancelRecentPn) => {
    if (!n?.pnId) {
      return
    }
    const uuid = this.getUuidFromPnId(n.pnId)
    console.log(`SIP PN debug: cancel PN uuid=${uuid}`)
    this.setCallkeepAction({ pnId: n.pnId }, 'rejectCall')
    uuid &&
      this.endCallKeep(uuid, {
        completedElseWhere: n.completedElseWhere,
      })
  }

  constructor() {
    if (Platform.OS === 'android') {
      BrekekeUtils.setIsAppActive(AppState.currentState === 'active', false)
      // If it is locked right after blur 300ms
      // we assume it was put in background because of lock
      AppState.addEventListener('change', () => {
        BrekekeUtils.setIsAppActive(AppState.currentState === 'active', false)
        if (AppState.currentState === 'active') {
          return
        }
        BackgroundTimer.setTimeout(async () => {
          if (await BrekekeUtils.isLocked()) {
            BrekekeUtils.setIsAppActive(false, true)
          }
        }, 300)
      })
    }
  }

  @observable parkNumbers: { [k: string]: boolean } = {}
  @action addParkNumber = (parkNumber: string) => {
    this.parkNumbers[parkNumber] = true
  }
  @action removeParkNumber = (parkNumber: string) => {
    delete this.parkNumbers[parkNumber]
  }

  // Some other fields
  // TODO move them somewhere else
  @observable isLoudSpeakerEnabled = false
  @action toggleLoudSpeaker = () => {
    if (Platform.OS !== 'web') {
      this.isLoudSpeakerEnabled = !this.isLoudSpeakerEnabled
      IncallManager.setForceSpeakerphoneOn(this.isLoudSpeakerEnabled)
    }
  }
  @observable newVoicemailCount = 0
  @action setNewVoicemailCount = (n: number) => {
    this.newVoicemailCount = n
  }
  // Style in CallVideosUI to save the previous video position
  @observable videoPositionT = 25
  @observable videoPositionL = 5
}

const callStore = new CallStore()
setCallStore(callStore)

export type TCallkeepAction = 'answerCall' | 'rejectCall'
type TCallkeepIds = Partial<Pick<Call, 'callkeepUuid' | 'pnId'>>
