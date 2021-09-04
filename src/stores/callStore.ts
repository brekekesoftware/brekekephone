import debounce from 'lodash/debounce'
import { action, observable, runInAction } from 'mobx'
import { AppState, Platform } from 'react-native'
import RNCallKeep, { CONSTANTS } from 'react-native-callkeep'
import IncallManager from 'react-native-incall-manager'
import { v4 as newUuid } from 'uuid'

import { pbx } from '../api/pbx'
import { sip } from '../api/sip'
import { uc } from '../api/uc'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { TEvent } from '../utils/callkeep'
import { ParsedPn } from '../utils/PushNotification-parse'
import { IncomingCall } from '../utils/RnNativeModules'
import { arrToMap } from '../utils/toMap'
import { addCallHistory } from './addCallHistory'
import { authSIP } from './AuthSIP'
import { getAuthStore, reconnectAndWaitSip } from './authStore'
import { Call } from './Call'
import { Nav } from './Nav'
import { RnStacker } from './RnStacker'

export class CallStore {
  private recentCallActivityAt = 0

  private prevCallKeepUuid?: string
  private getIncomingCallkeep = (
    uuid: string,
    o?: {
      includingAnswered?: boolean
      includingRejected?: boolean
    },
  ) => {
    const pnId = this.getPnIdFromUuid(uuid)
    return this.calls.find(
      c =>
        c.incoming &&
        !c.isAboutToHangup &&
        (!c.callkeepUuid || c.callkeepUuid === uuid) &&
        (o?.includingAnswered || (!c.answered && !c.callkeepAlreadyAnswered)) &&
        (o?.includingRejected || !c.callkeepAlreadyRejected) &&
        (!pnId || c.pnId === pnId),
    )
  }
  onCallKeepDidDisplayIncomingCall = (uuid: string, pnData: ParsedPn) => {
    this.setAutoEndCallKeepTimer(uuid, pnData)
    // Check if call is rejected already
    const rejected = this.isCallRejected({
      callkeepUuid: uuid,
      pnId: pnData.id,
    })
    // Find the current incoming call which is not callkeep
    const c = this.getIncomingCallkeep(uuid)
    if (c) {
      c.callkeepUuid = uuid
    }
    console.error(
      `SIP PN debug: onCallKeepDidDisplayIncomingCall uuid=${uuid} pnId=${pnData.id} sessionId=${c?.id} rejected=${rejected}`,
    )
    if (rejected) {
      this.endCallKeep(uuid)
      return
    }
    // ios allow only 1 callkeep
    if (Platform.OS === 'ios' && this.prevCallKeepUuid) {
      const prevCall = this.calls.find(
        _ => _.callkeepUuid === this.prevCallKeepUuid,
      )
      if (prevCall) {
        prevCall.callkeepAlreadyRejected = true
      }
      this.endCallKeep(this.prevCallKeepUuid)
    }
    this.prevCallKeepUuid = uuid
    // Auto reconnect if no activity
    // This logic is about the case connection has dropped silently
    // So even if sipState is `success` but the connection has dropped
    // We just drop the connection no matter if it is alive or not
    // Then construct a new connection to receive the call as quickly as possible
    const now = Date.now()
    if (now - this.recentCallActivityAt > 3000) {
      const as = getAuthStore()
      if (as.sipState === 'connecting') {
        return
      }
      const count = sip.phone?.getSessionCount()
      if (!count) {
        console.error(
          `SIP PN debug: new notification: phone.getSessionCount()=${count} | call destroyWebRTC()`,
        )
        as.sipState = 'stopped'
        sip.destroyWebRTC()
        authSIP.authWithCheck()
      }
    }
  }
  onCallKeepAnswerCall = (uuid: string) => {
    this.setCallkeepAction({ callkeepUuid: uuid }, 'answerCall')
    const c = this.getIncomingCallkeep(uuid)
    console.error(`SIP PN debug: onCallKeepAnswerCall found: ${!!c}`)
    if (c && !c.callkeepAlreadyAnswered) {
      c.callkeepAlreadyAnswered = true
      c.answer()
    }
  }
  onCallKeepEndCall = (uuid: string) => {
    this.setCallkeepAction({ callkeepUuid: uuid }, 'rejectCall')
    const c = this.getIncomingCallkeep(uuid, {
      includingAnswered: true,
      includingRejected: Platform.OS === 'android',
    })
    console.error(`SIP PN debug: onCallKeepEndCall found: ${!!c}`)
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
    return this.calls.find(c => c.id === this.currentCallId)
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
  @action private upsertCall = (
    cPartial: Pick<Call, 'id'> & Partial<Omit<Call, 'id'>>,
  ) => {
    const now = Date.now()
    this.recentCallActivityAt = now
    const cExisting = this.calls.find(c => c.id === cPartial.id)
    if (cExisting) {
      if (!cExisting.answered && cPartial.answered) {
        cPartial.answeredAt = now
      }
      Object.assign(cExisting, cPartial)
      if (cExisting.incoming && cExisting.callkeepUuid) {
        IncomingCall.setRemoteVideoStreamURL(
          cExisting.callkeepUuid,
          cExisting.remoteVideoStreamObject
            ? cExisting.remoteVideoStreamObject.toURL()
            : '',
        )
      }
      if (
        cExisting.incoming &&
        cExisting.callkeepUuid &&
        typeof cExisting.localVideoEnabled === 'boolean'
      ) {
        IncomingCall.setIsVideoCall(
          cExisting.callkeepUuid,
          !!cExisting.localVideoEnabled,
        )
      }
      return
    }
    // Construct a new call
    const c = new Call(this)
    Object.assign(c, cPartial)
    this.calls = [c, ...this.calls]
    IncomingCall.setBackgroundCalls(this.calls.length)
    // Get and check callkeep if pending incoming call
    if (Platform.OS === 'web' || !c.incoming || c.answered) {
      return
    }
    c.callkeepUuid = c.callkeepUuid || this.getUuidFromPnId(c.pnId) || ''
    const callkeepAction = this.getCallkeepAction(c)
    console.error(
      `PN ID debug: upsertCall pnId=${c.pnId} callkeepUuid=${c.callkeepUuid} callkeepAction=${callkeepAction}`,
    )
    if (callkeepAction === 'answerCall') {
      c.callkeepAlreadyAnswered = true
      c.answer()
      console.error('SIP PN debug: answer by recentPnAction')
    } else if (callkeepAction === 'rejectCall') {
      c.callkeepAlreadyRejected = true
      c.hangupWithUnhold()
      console.error('SIP PN debug: reject by recentPnAction')
    }
  }

  @action onCallRemove = (id: string) => {
    this.recentCallActivityAt = Date.now()
    const c = this.calls.find(_ => _.id === id)
    if (!c) {
      return
    }
    this.onSipUaCancel(c.pnId)
    c.callkeepUuid && this.endCallKeep(c.callkeepUuid)
    c.callkeepUuid = ''
    c.callkeepAlreadyRejected = true
    addCallHistory(c)
    this.calls = this.calls.filter(c0 => c0 !== c)
    // Set number of total calls in our custom java incoming call module
    IncomingCall.setBackgroundCalls(this.calls.length)
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
    // Update current call
    this.updateCurrentCallDebounce()
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
  startCall = async (number: string, options = {}) => {
    let reconnectCalled = false
    const sipCreateSession = () => sip.createSession(number, options)
    try {
      // Try to call pbx first to see if there's any error with the network
      await pbx.getConfig()
      sipCreateSession()
    } catch (err) {
      reconnectCalled = true
      reconnectAndWaitSip().then(sipCreateSession)
    }
    Nav().goToPageCallManage()
    // Start call logic in RNCallKeep
    // Adding this will help the outgoing call automatically hold on GSM call
    // Only for ios, android will be done in callkeep didDeactivateAudioSession
    let uuid = ''
    if (Platform.OS === 'ios' && !Object.keys(this.callkeepMap).length) {
      uuid = newUuid().toUpperCase()
      RNCallKeep.startCall(uuid, number, 'Brekeke Phone')
      RNCallKeep.reportConnectedOutgoingCallWithUUID(uuid)
      RNCallKeep.setOnHold(uuid, false)
      this.setAutoEndCallKeepTimer(uuid)
    }
    // Check for each 0.5s: auto update currentCallId
    // The call will be emitted from sip, we'll use interval here to set it
    this.currentCallId = ''
    const prevIds = arrToMap(this.calls, 'id') as { [k: string]: boolean }
    // Also if after 3s there's no call in store, reconnect
    this.clearStartCallIntervalTimer()
    this.startCallIntervalAt = Date.now()
    this.startCallIntervalId = BackgroundTimer.setInterval(() => {
      const curr = this.calls.find(c => !c.incoming && !prevIds[c.id])
      if (curr) {
        if (uuid) {
          curr.callkeepUuid = uuid
          this.prevCallKeepUuid = uuid
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
    }, 500)
  }
  startVideoCall = (number: string) =>
    this.startCall(number, { videoEnabled: true })

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
    let curr: Call | undefined
    if (this.calls.length) {
      curr =
        this.calls.find(c => c.id === this.currentCallId) ||
        this.calls.find(c => c.answered && !c.holding && !c.isAboutToHangup) ||
        this.calls[0]
    }
    const currentCallId = curr?.id || ''
    if (currentCallId !== this.currentCallId) {
      this.currentCallId = currentCallId
    }
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
  private setAutoEndCallKeepTimer = (
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
      this.updateCurrentCallDebounce()
    }, 500)
  }
  private endCallKeep = (uuid: string) => {
    if (!uuid) {
      return
    }
    console.error('PN callkeep debug: endCallKeep ' + uuid)
    this.setCallkeepAction({ callkeepUuid: uuid }, 'rejectCall')
    const pnData = this.callkeepMap[uuid]?.incomingPnData
    if (
      pnData &&
      !this.calls.some(c => c.callkeepUuid === uuid || c.pnId === pnData.id)
    ) {
      addCallHistory(pnData)
    }
    runInAction(() => {
      delete this.callkeepMap[uuid]
    })
    RNCallKeep.rejectCall(uuid)
    RNCallKeep.endCall(uuid)
    RNCallKeep.reportEndCallWithUUID(
      uuid,
      CONSTANTS.END_CALL_REASONS.REMOTE_ENDED,
    )
    if (uuid === this.prevCallKeepUuid) {
      this.prevCallKeepUuid = undefined
    }
    IncomingCall.closeIncomingCallActivity(uuid)
  }
  endCallKeepAll = () => {
    if (Platform.OS !== 'web') {
      RNCallKeep.endAllCalls()
    }
    IncomingCall.closeAllIncomingCallActivities()
  }

  // Move from callkeep.ts to avoid circular dependencies
  // Logic to show incoming call ui in case of already have a running call in RNCallKeep android
  private alreadyShowIncomingCallUi: { [k: string]: boolean } = {}
  showIncomingCallUi = (e: TEvent & { pnData: ParsedPn }) => {
    const uuid = e.callUUID.toUpperCase()
    if (this.alreadyShowIncomingCallUi[uuid]) {
      return
    }
    this.alreadyShowIncomingCallUi[uuid] = true
    if (this.isCallRejected({ callkeepUuid: uuid, pnId: e.pnData.id })) {
      this.endCallKeep(uuid)
      return
    }
    this.onCallKeepDidDisplayIncomingCall(uuid, e.pnData)
  }

  // Actions map in case of call is not available at the time receive the action
  // This map wont be deleted if the callkeep end
  private callkeepActionMap: {
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
  }
  private getCallkeepAction = (c: TCallkeepIds) =>
    (c.callkeepUuid && this.callkeepActionMap[c.callkeepUuid]) ||
    (c.pnId && this.callkeepActionMap[c.pnId])
  isCallRejected = (c?: TCallkeepIds) =>
    c && this.getCallkeepAction(c) === 'rejectCall'

  // To be used in sip.phone._ua.on('newNotify')
  onSipUaCancel = (pnId?: string) => {
    if (!pnId) {
      return
    }
    const uuid = this.getUuidFromPnId(pnId)
    console.error(`SIP PN debug: cancel PN uuid=${uuid}`)
    this.setCallkeepAction({ pnId }, 'rejectCall')
    uuid && this.endCallKeep(uuid)
  }

  // Additional static logic
  constructor() {
    if (Platform.OS === 'android') {
      IncomingCall.setIsAppActive(AppState.currentState === 'active', false)
      // If it is locked right after blur, we assume it was put in background because of lock
      AppState.addEventListener('change', () => {
        IncomingCall.setIsAppActive(AppState.currentState === 'active', false)
        if (AppState.currentState === 'active') {
          return
        }
        BackgroundTimer.setTimeout(async () => {
          if (await IncomingCall.isLocked()) {
            IncomingCall.setIsAppActive(false, true)
          }
        }, 300)
      })
    }
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

export const callStore = new CallStore() as Immutable<CallStore>

type TCallkeepAction = 'answerCall' | 'rejectCall'
type TCallkeepIds = Partial<Pick<Call, 'callkeepUuid' | 'pnId'>>
