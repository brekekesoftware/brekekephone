import debounce from 'lodash/debounce'
import { action, observable, runInAction } from 'mobx'
import moment from 'moment'
import { AppState, Platform } from 'react-native'
import RNCallKeep, { CONSTANTS } from 'react-native-callkeep'
import IncallManager from 'react-native-incall-manager'
import { v4 as newUuid } from 'uuid'

import pbx from '../api/pbx'
import sip from '../api/sip'
import uc from '../api/uc'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { TEvent } from '../utils/callkeep'
import { ParsedPn } from '../utils/PushNotification-parse'
import { IncomingCall } from '../utils/RnNativeModules'
import { arrToMap } from '../utils/toMap'
import { authSIP } from './AuthSIP'
import { getAuthStore, reconnectAndWaitSip } from './authStore'
import Call from './Call'
import Nav from './Nav'
import RnStacker from './RnStacker'

export class CallStore {
  recentCallActivityAt = 0

  cancelRecentPn = (pnId?: string) => {
    if (!pnId) {
      return
    }
    cancelPn(pnId)
    const uuid = getCallPnDataById(pnId)?.callkeepUuid
    console.error(`SIP PN debug: cancel PN uuid=${uuid}`)
    endCallKeep(uuid)
  }

  prevCallKeepUuid?: string
  private getIncomingCallKeep = (
    uuid: string,
    o?: {
      from?: string
      includingAnswered?: boolean
      includingRejected?: boolean
    },
  ) =>
    this.calls.find(
      c =>
        c.incoming &&
        (!c.callkeepUuid || c.callkeepUuid === uuid) &&
        (o?.includingAnswered || (!c.answered && !c.callkeepAlreadyAnswered)) &&
        (o?.includingRejected || !c.callkeepAlreadyRejected) &&
        (!o?.from || c.partyNumber === o.from),
    )
  onCallKeepDidDisplayIncomingCall = (uuid: string) => {
    const pnData = getCallPnData(uuid)
    const canceled = isPnCanceled(pnData?.id)
    console.error(
      `SIP PN debug: onCallKeepDidDisplayIncomingCall pnId=${pnData?.id} canceled=${canceled}`,
    )
    if (canceled) {
      endCallKeep(uuid)
      return
    }
    // Find the current incoming call which is not callkeep
    const c = this.getIncomingCallKeep(uuid, {
      from: pnData?.from,
    })
    if (c) {
      // If the call is existing and not answered yet, we'll mark that call as displaying in callkeep
      // We assume that the app is being used in foreground (not quite exactly but assume)
      c.callkeepUuid = uuid
      RNCallKeep.updateDisplay(uuid, c.partyName, 'Brekeke Phone', {
        hasVideo: c.remoteVideoEnabled,
      })
    }
    // ios allow only 1 callkeep
    if (Platform.OS === 'ios' && this.prevCallKeepUuid) {
      const prevCall = this.calls.find(
        c => c.callkeepUuid === this.prevCallKeepUuid,
      )
      if (prevCall) {
        prevCall.callkeepAlreadyRejected = true
      }
      endCallKeep(this.prevCallKeepUuid)
    }
    this.prevCallKeepUuid = uuid
    setAutoEndCallKeepTimer(uuid)
    // Auto reconnect if no activity
    const now = Date.now()
    if (now - this.recentCallActivityAt > 3000) {
      const as = getAuthStore()
      if (as.sipState === 'connecting' || as.sipState === 'success') {
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
    callkeepActionMap[uuid] = 'answered'
    const c = this.getIncomingCallKeep(uuid, {
      from: getCallPnData(uuid)?.from,
    })
    if (c && !c.callkeepAlreadyAnswered) {
      c.callkeepAlreadyAnswered = true
      c.answer()
      console.error('SIP PN debug: answer by onCallKeepAnswerCall')
    }
  }
  onCallKeepEndCall = (uuid: string) => {
    callkeepActionMap[uuid] = 'rejected'
    const c = this.getIncomingCallKeep(uuid, {
      from: getCallPnData(uuid)?.from,
      includingAnswered: true,
      includingRejected: Platform.OS === 'android',
    })
    if (c) {
      c.callkeepAlreadyRejected = true
      c.hangupWithUnhold()
      console.error('SIP PN debug: reject by onCallKeepEndCall')
    }
    endCallKeep(uuid)
  }

  @observable calls: Call[] = []
  @observable currentCallId: string = ''
  currentCall = () => {
    this.updateCurrentCallDebounce()
    return this.calls.find(c => c.id === this.currentCallId)
  }

  private incallManagerStarted = false
  upsertCall: CallStore['upsertCallWithoutIncallManager'] = c => {
    this.upsertCallWithoutIncallManager(c)
    if (
      Platform.OS === 'android' &&
      !this.incallManagerStarted &&
      this.calls.find(c => c.answered || !c.incoming)
    ) {
      this.incallManagerStarted = true
      IncallManager.start()
      IncallManager.setForceSpeakerphoneOn(false)
    }
  }
  @action private upsertCallWithoutIncallManager = (
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
    if (cPartial.incoming) {
      console.error(`PN ID debug: upsertCall pnId=${cPartial.pnId}`)
    }
    // Construct a new call
    const c = new Call(this)
    Object.assign(c, cPartial)
    if (isPnCanceled(c.pnId)) {
      c.hangupWithUnhold()
      console.error(`SIP PN debug: reject by isPnCanceled pnId=${c.pnId}`)
      return
    }
    this.calls = [c, ...this.calls]
    IncomingCall.setBackgroundCalls(this.calls.length)
    // Get and check callkeep
    if (!c.callkeepUuid) {
      c.callkeepUuid = getCallPnDataById(c.pnId)?.callkeepUuid || ''
    }
    const callkeepAction = callkeepActionMap[c.callkeepUuid]
    if (Platform.OS === 'web' || !callkeepAction || !c.incoming || c.answered) {
      return
    }
    if (callkeepAction === 'answered') {
      c.callkeepAlreadyAnswered = true
      c.answer()
      console.error('SIP PN debug: answer by recentPnAction')
    } else if (callkeepAction === 'rejected') {
      c.callkeepAlreadyRejected = true
      c.hangupWithUnhold()
      console.error('SIP PN debug: reject by recentPnAction')
    }
  }

  @action removeCall = (id: string) => {
    this.recentCallActivityAt = Date.now()
    const c = this.calls.find(c => c.id === id)
    if (!c) {
      return
    }
    if (c.pnId) {
      cancelPn(c.pnId)
    }
    addCallHistory(c)
    this.calls = this.calls.filter(c0 => c0 !== c)
    IncomingCall.setBackgroundCalls(this.calls.length)
    if (c.callkeepUuid) {
      const uuid = c.callkeepUuid
      c.callkeepUuid = ''
      c.callkeepAlreadyRejected = true
      endCallKeep(uuid)
    }
    if (getAuthStore().ucState === 'success' && c.duration && !c.incoming) {
      uc.sendCallResult(c.duration, c.partyNumber)
    }
    if (Platform.OS !== 'web' && !this.calls.length) {
      this.isLoudSpeakerEnabled = false
      IncallManager.setForceSpeakerphoneOn(false)
    }
    this.updateCurrentCallDebounce()
    if (
      Platform.OS === 'android' &&
      this.incallManagerStarted &&
      !this.calls.length
    ) {
      this.incallManagerStarted = false
      IncallManager.stop()
    }
  }

  @action selectBackgroundCall = (c: Call) => {
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
    let uuid = ''
    if (Platform.OS === 'ios' && !hasCallKeepRunning()) {
      uuid = newUuid().toUpperCase()
      RNCallKeep.startCall(uuid, number, 'Brekeke Phone')
      RNCallKeep.reportConnectedOutgoingCallWithUUID(uuid)
      RNCallKeep.setOnHold(uuid, false)
      setAutoEndCallKeepTimer(uuid)
    }
    // Check for each 0.5s
    // Auto update currentCallId
    this.currentCallId = ''
    const prevIds = arrToMap(this.calls, 'id') as { [k: string]: boolean }
    // And if after 3s there's no call in store, reconnect
    this.clearStartCallIntervalTimer()
    this.startCallIntervalAt = Date.now()
    this.startCallIntervalId = BackgroundTimer.setInterval(() => {
      const curr = this.calls.find(c => !prevIds[c.id])
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
          endCallKeep(uuid)
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

  startVideoCall = (number: string) => {
    this.startCall(number, {
      videoEnabled: true,
    })
  }

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
    {
      maxWait: 1000,
    },
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
  updateCurrentCallDebounce = debounce(this.updateCurrentCall, 300, {
    maxWait: 1000,
  })

  @observable isLoudSpeakerEnabled = false
  @action toggleLoudSpeaker = () => {
    if (Platform.OS !== 'web') {
      this.isLoudSpeakerEnabled = !this.isLoudSpeakerEnabled
      IncallManager.setForceSpeakerphoneOn(this.isLoudSpeakerEnabled)
    }
  }

  @observable newVoicemailCount = 0

  // Style in CallVideosUI to save the previous video position
  @observable videoPositionT = 25
  @observable videoPositionL = 5

  dispose = () => {
    this.clearStartCallIntervalTimer()
  }

  @observable callPnDataMap: {
    [uuid: string]: ParsedPn
  } = {}
}

const callStore = new CallStore()
export default callStore

// Logic to end call if timeout of 20s
const callkeepMap: {
  [uuid: string]: {
    uuid: string
    at: number
  }
} = {}
const callkeepActionMap: {
  [uuid: string]: 'answered' | 'rejected'
} = {}
let autoEndCallKeepTimerId = 0
const clearAutoEndCallKeepTimer = () => {
  if (Platform.OS === 'web' || !autoEndCallKeepTimerId) {
    return
  }
  BackgroundTimer.clearInterval(autoEndCallKeepTimerId)
  autoEndCallKeepTimerId = 0
}
const setAutoEndCallKeepTimer = (uuid?: string) => {
  if (Platform.OS === 'web') {
    return
  }
  if (uuid) {
    callkeepMap[uuid] = {
      uuid,
      at: Date.now(),
    }
  }

  clearAutoEndCallKeepTimer()
  autoEndCallKeepTimerId = BackgroundTimer.setInterval(() => {
    const n = Date.now()
    Object.values(callkeepMap).forEach(k => {
      if (n - k.at > 20000) {
        const c = callStore.calls.find(c => c.callkeepUuid === k.uuid)
        if (!c) {
          endCallKeep(k.uuid)
        }
      }
    })
    if (!Object.keys(callkeepMap).length) {
      clearAutoEndCallKeepTimer()
    }
    callStore.updateCurrentCallDebounce()
  }, 500)
}
const endCallKeep = (uuid?: string) => {
  if (!uuid) {
    return
  }
  console.error('PN callkeep debug: endCallKeep ' + uuid)
  const pnData = getCallPnData(uuid)
  if (
    pnData &&
    !callStore.calls.some(c => c.callkeepUuid === uuid || c.pnId === pnData.id)
  ) {
    addCallHistory(pnData)
  }
  RNCallKeep.rejectCall(uuid)
  RNCallKeep.endCall(uuid)
  RNCallKeep.reportEndCallWithUUID(
    uuid,
    CONSTANTS.END_CALL_REASONS.REMOTE_ENDED,
  )
  runInAction(() => {
    delete callStore.callPnDataMap[uuid]
    delete callkeepMap[uuid]
  })
  if (uuid === callStore.prevCallKeepUuid) {
    callStore.prevCallKeepUuid = undefined
  }
  IncomingCall.closeIncomingCallActivity(uuid)
}
export const endCallKeepAll = () => {
  if (Platform.OS !== 'web') {
    RNCallKeep.endAllCalls()
  }
  IncomingCall.closeAllIncomingCallActivities()
}

// Move from callkeep.ts to avoid circular dependencies
// Logic to show incoming call ui in case of already have a running call in RNCallKeep android
export const hasCallKeepRunning = () => !!Object.keys(callkeepMap).length
const alreadyShowIncomingCallUi: { [k: string]: boolean } = {}

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

export const showIncomingCallUi = (e: TEvent) => {
  const uuid = e.callUUID.toUpperCase()
  if (alreadyShowIncomingCallUi[uuid]) {
    return
  }
  alreadyShowIncomingCallUi[uuid] = true
  const pnData = getCallPnData(uuid)
  if (!pnData || isPnCanceled(pnData.id)) {
    endCallKeep(uuid)
    return
  }
  callStore.onCallKeepDidDisplayIncomingCall(uuid)
  console.error('SIP PN debug: successfully display incoming call UI')
}

// Move from pushNotification-parse.ts to avoid circular dependencies
export const setCallPnData = (uuid: string, n: ParsedPn): void => {
  console.error(`PN ID debug: setCallPnData pnId=${n.id}`)
  if (n.callkeepUuid) {
    console.error(`PN ID debug: found n.callkeepUuid=${n.callkeepUuid}`)
  }
  if (n.callkeepUuid && n.callkeepUuid !== uuid) {
    console.error(`PN ID debug: n.callkeepUuid different with uuid=${uuid}`)
  }
  n.callkeepUuid = uuid
  runInAction(() => {
    callStore.callPnDataMap[uuid] = n
  })
}
export const getCallPnData = (uuid: string): ParsedPn | undefined =>
  callStore.callPnDataMap[uuid]
export const getCallPnDataById = (pnId: string) =>
  Object.values(callStore.callPnDataMap).find(n => n.id === pnId)

// Canceled pn from sip header event
const pnCanceledMap: { [pnId: string]: true } = {}
const cancelPn = (pnId: string) => {
  console.error(`SIP PN debug: got event cancel for pnId=${pnId}`)
  pnCanceledMap[pnId] = true
}
export const isPnCanceled = (pnId?: string) => !!(pnId && pnCanceledMap[pnId])

// Save call history
const alreadyAddHistoryMap: { [pnId: string]: true } = {}
const addCallHistory = (c: Call | ParsedPn) => {
  const pnId =
    c instanceof Call || 'partyName' in c || 'partyNumber' in c ? c.pnId : c.id
  if (pnId) {
    if (alreadyAddHistoryMap[pnId]) {
      return
    }
    alreadyAddHistoryMap[pnId] = true
  }
  const as = getAuthStore()
  const id = newUuid()
  const created = moment().format('HH:mm - MMM D')
  if (c instanceof Call || 'partyName' in c || 'partyNumber' in c) {
    as.pushRecentCall({
      id,
      created,
      incoming: c.incoming,
      answered: c.answered,
      partyName: c.partyName,
      partyNumber: c.partyNumber,
      duration: c.duration,
    })
  } else {
    as.pushRecentCall({
      id,
      created,
      incoming: true,
      answered: false,
      partyName: c.from,
      partyNumber: c.from,
      duration: 0,
    })
  }
}
