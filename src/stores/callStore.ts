import debounce from 'lodash/debounce'
import { action, observable } from 'mobx'
import moment from 'moment'
import { AppState, Platform } from 'react-native'
import RNCallKeep, { CONSTANTS } from 'react-native-callkeep'
import IncallManager from 'react-native-incall-manager'
import { v4 as newUuid } from 'react-native-uuid'

import pbx from '../api/pbx'
import sip from '../api/sip'
import uc from '../api/uc'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { TEvent } from '../utils/callkeep'
import { ParsedPn } from '../utils/PushNotification-parse'
import { IncomingCall } from '../utils/RnNativeModules'
import { arrToMap } from '../utils/toMap'
import { getAuthStore, reconnectAndWaitSip } from './authStore'
import Call from './Call'
import Nav from './Nav'

export class CallStore {
  @observable recentPn?: {
    uuid: string
    at: number
    action?: 'answered' | 'rejected'
  }
  recentCallActivityAt = 0

  cancelRecentPn = (pnId?: string) => {
    if (!pnId) {
      return
    }
    const uuid =
      Object.entries(callPnDataMap).filter(
        ([uuid, n]) => n.id === pnId,
      )[0]?.[0] ||
      this.recentPn?.uuid ||
      this.prevCallKeepUuid ||
      ''
    console.error(`SIP PN debug: cancel PN uuid=${uuid}`)
    endCallKeep(uuid, true)
  }

  prevCallKeepUuid?: string
  private getIncomingCallKeep = (
    uuid: string,
    o?: {
      from?: string
      includingAnswered?: boolean
      includeCallKeepAlreadyRejected?: boolean
    },
  ) =>
    this.calls.find(
      c =>
        c.incoming &&
        (o?.includeCallKeepAlreadyRejected || !c.callkeepAlreadyRejected) &&
        (!c.callkeepUuid || c.callkeepUuid === uuid) &&
        (o?.includingAnswered || (!c.answered && !c.callkeepAlreadyAnswered)) &&
        (!o?.from || c.partyNumber === o.from),
    )
  onCallKeepDidDisplayIncomingCall = (uuid: string) => {
    // Find the current incoming call which is not callkeep
    const c = this.getIncomingCallKeep(uuid, {
      from: getCallPnData(uuid)?.from,
    })
    if (c) {
      // If the call is existing and not answered yet, we'll mark that call as displaying in callkeep
      // We assume that the app is being used in foreground (not quite exactly but assume)
      c.callkeepUuid = uuid
      RNCallKeep.updateDisplay(uuid, c.partyName, 'Brekeke Phone', {
        hasVideo: c.remoteVideoEnabled,
      })
      this.recentPn = undefined
    } else {
      // Otherwise save the data for later process
      this.recentPn = {
        uuid,
        at: Date.now(),
      }
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
  }
  onCallKeepAnswerCall = (uuid: string) => {
    const c = this.getIncomingCallKeep(uuid, {
      from: getCallPnData(uuid)?.from,
    })
    if (c && !c.callkeepAlreadyAnswered) {
      c.callkeepAlreadyAnswered = true
      c.answer()
      this.recentPn = undefined
      console.error('SIP PN debug: answer by onCallKeepAnswerCall')
    } else if (this.recentPn?.uuid === uuid) {
      this.recentPn.action = 'answered'
    } else {
      this.recentPn = undefined
    }
  }
  onCallKeepEndCall = (uuid: string) => {
    const c = this.getIncomingCallKeep(uuid, {
      from: getCallPnData(uuid)?.from,
      includingAnswered: true,
      includeCallKeepAlreadyRejected: Platform.OS === 'android',
    })
    if (c) {
      c.callkeepAlreadyRejected = true
      c.hangupWithUnhold()
      this.recentPn = undefined
      console.error('SIP PN debug: reject by onCallKeepEndCall')
    } else if (this.recentPn?.uuid === uuid) {
      this.recentPn.action = 'rejected'
    } else {
      this.recentPn = undefined
    }
    endCallKeep(uuid)
  }

  endCallKeepByCall = (
    // To keep reference on the Call type, use Pick
    c?: Pick<Call, 'callkeepUuid'> &
      Partial<Pick<Call, 'callkeepAlreadyRejected'>>,
  ) => {
    if (c?.callkeepUuid) {
      const uuid = c.callkeepUuid
      c.callkeepUuid = ''
      c.callkeepAlreadyRejected = true
      endCallKeep(uuid, true)
    }
  }

  @observable calls: Call[] = []
  @observable currentCallId: string = ''
  currentCall = () => {
    BackgroundTimer.setTimeout(this.updateCurrentCallDebounce, 17)
    return this.calls.find(c => c.id === this.currentCallId)
  }

  @action upsertCall = (
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
      return
    }
    // Construct a new call
    const c = new Call(this)
    Object.assign(c, cPartial)
    this.calls = [c, ...this.calls]
    IncomingCall.setBackgroundCalls(this.calls.length)

    // Get and check callkeep
    let recentPnUuid = ''
    let recentPnAction = ''
    if (this.recentPn && now - this.recentPn.at < 20000) {
      recentPnUuid = this.recentPn.uuid
      recentPnAction = this.recentPn.action || ''
    }
    if (Platform.OS === 'web' || !recentPnUuid || !c.incoming || c.answered) {
      return
    }
    this.recentPn = undefined
    // Assign callkeep to the call and handle logic
    if (recentPnUuid) {
      c.callkeepUuid = recentPnUuid
    }
    if (!recentPnAction) {
      RNCallKeep.updateDisplay(recentPnUuid, c.partyName, 'Brekeke Phone', {
        hasVideo: c.remoteVideoEnabled,
      })
      return
    }
    if (recentPnAction === 'answered') {
      c.callkeepAlreadyAnswered = true
      c.answer()
      console.error('SIP PN debug: answer by recentPnAction')
    } else if (recentPnAction === 'rejected') {
      c.callkeepAlreadyRejected = true
      c.hangupWithUnhold()
      console.error('SIP PN debug: reject by recentPnAction')
    }
  }
  @action removeCall = (id: string) => {
    this.recentCallActivityAt = Date.now()
    const c = this.calls.find(c => c.id === id)
    if (c) {
      getAuthStore().pushRecentCall({
        id: newUuid(),
        incoming: c.incoming,
        answered: c.answered,
        partyName: c.partyName,
        partyNumber: c.partyNumber,
        duration: c.duration,
        created: moment().format('HH:mm - MMM D'),
      })
      if (uc.client && c.duration && !c.incoming) {
        uc.sendCallResult(c.duration, c.partyNumber)
      }
    }
    this.calls = this.calls.filter(c => c.id !== id)
    this.endCallKeepByCall(c)
    if (Platform.OS !== 'web' && !this.calls.length) {
      this.isLoudSpeakerEnabled = false
      IncallManager.setForceSpeakerphoneOn(false)
    }
    IncomingCall.setBackgroundCalls(this.calls.length)
  }

  @action selectBackgroundCall = (c: Call) => {
    console.error('callStore.selectBackgroundCall')
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
    if (Platform.OS === 'ios' && !Object.keys(callkeepMap).length) {
      uuid = newUuid().toUpperCase()
      RNCallKeep.startCall(uuid, number, 'Brekeke Phone')
      RNCallKeep.reportConnectingOutgoingCallWithUUID(uuid)
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
          RNCallKeep.reportConnectedOutgoingCallWithUUID(uuid)
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

  private updateCurrentCall = () => {
    let curr: Call | undefined
    if (this.calls.length) {
      curr =
        this.calls.find(c => c.id === this.currentCallId) ||
        this.calls.find(c => c.answered && !c.holding) ||
        this.calls[0]
    }
    const currentCallId = curr?.id || ''
    if (currentCallId !== this.currentCallId) {
      BackgroundTimer.setTimeout(
        action(() => (this.currentCallId = currentCallId)),
        17,
      )
    }
    BackgroundTimer.setTimeout(this.updateBackgroundCallsDebounce, 17)
  }
  updateCurrentCallDebounce = debounce(this.updateCurrentCall, 300, {
    maxWait: 1000,
  })
  private updateBackgroundCalls = () => {
    // Auto hold background calls
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
  updateBackgroundCallsDebounce = debounce(this.updateBackgroundCalls, 300, {
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
        if (c && !c.answered && !c.callkeepAlreadyAnswered) {
          c.hangupWithUnhold()
        }
        if (!c) {
          endCallKeep(k.uuid)
        }
      }
    })
    if (!Object.keys(callkeepMap).length) {
      clearAutoEndCallKeepTimer()
    }
    callStore.updateCurrentCallDebounce()
    callStore.updateBackgroundCallsDebounce()
  }, 500)
}
const endCallKeep = (uuid: string, clearRecentPn?: boolean) => {
  console.error('PN callkeep debug: endCallKeep ' + uuid)
  RNCallKeep.rejectCall(uuid)
  RNCallKeep.endCall(uuid)
  RNCallKeep.reportEndCallWithUUID(
    uuid,
    CONSTANTS.END_CALL_REASONS.REMOTE_ENDED,
  )
  delete callPnDataMap[uuid]
  delete callkeepMap[uuid]
  if (uuid === callStore.prevCallKeepUuid) {
    callStore.prevCallKeepUuid = undefined
  }
  if (
    clearRecentPn &&
    (uuid === callStore.prevCallKeepUuid || uuid === callStore.recentPn?.uuid)
  ) {
    callStore.recentPn = undefined
  }
  IncomingCall.closeIncomingCallActivity(uuid)
}
export const endCallKeepAll = () => {
  RNCallKeep.endAllCalls()
  IncomingCall.closeAllIncomingCallActivities()
}

// Move from callkeep.ts to avoid circular dependencies
// Logic to show incoming call ui in case of already have a running call in RNCallKeep android
export const hasCallKeepRunning = () => !!Object.keys(callkeepMap).length
const alreadyShowIncomingCallUi: { [k: string]: boolean } = {}

let isForegroundLocked = false
if (Platform.OS === 'android') {
  // If it is locked right after blur, we assume it was put in background because of lock
  AppState.addEventListener('change', () => {
    if (AppState.currentState === 'active') {
      isForegroundLocked = false
      return
    }
    if (isForegroundLocked) {
      return
    }
    BackgroundTimer.setTimeout(async () => {
      isForegroundLocked = await IncomingCall.isLocked()
    }, 300)
  })
}

export const showIncomingCallUi = (e: TEvent) => {
  const uuid = e.callUUID.toUpperCase()
  if (alreadyShowIncomingCallUi[uuid]) {
    return
  }
  alreadyShowIncomingCallUi[uuid] = true
  IncomingCall.showCall(
    uuid,
    getCallPnData(uuid)?.from || 'Loading...',
    !!callStore.calls.find(c => c.incoming && c.remoteVideoEnabled),
    AppState.currentState === 'active' || isForegroundLocked,
  )
  callStore.onCallKeepDidDisplayIncomingCall(uuid)
}

// Move from pushNotification-parse.ts to avoid circular dependencies
const callPnDataMap: { [k: string]: ParsedPn } = {}
export const setCallPnData = (uuid: string, data: ParsedPn) => {
  callPnDataMap[uuid] = data
}

let lastCallPnData: ParsedPn | undefined = undefined
export const setLastCallPnData = (data: ParsedPn) => [(lastCallPnData = data)]
export const getCallPnData = (uuid: string) =>
  callPnDataMap[uuid] || lastCallPnData
