import debounce from 'lodash/debounce'
import { action, computed, observable } from 'mobx'
import moment from 'moment'
import { Platform } from 'react-native'
import RNCallKeep, { CONSTANTS } from 'react-native-callkeep'
import IncallManager from 'react-native-incall-manager'
import { v4 as uuid } from 'react-native-uuid'

import pbx from '../api/pbx'
import sip from '../api/sip'
import uc from '../api/uc'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { IncomingCall } from '../utils/RnNativeModules'
import { arrToMap } from '../utils/toMap'
import waitTimeout from '../utils/waitTimeout'
import { getAuthStore } from './authStore'
import Call from './Call'
import Nav from './Nav'
import { reconnectAndWaitSip } from './reconnectAndWaitSip'

export class CallStore {
  recentPn?: {
    uuid: string
    at: number
    action?: 'answered' | 'rejected'
  }
  recentCallActivityAt = 0

  cancelRecentPn = () => {
    const uuid = this.recentPn?.uuid || this.prevCallKeepUuid || ''
    console.error(`SIP PN debug: cancel PN uuid=${uuid}`)
    endCallKeep(uuid)
  }

  prevCallKeepUuid?: string
  private getIncomingCallkeep = (
    uuid: string,
    o?: { includingAnswered: boolean },
  ) =>
    this.calls.find(
      c =>
        c.incoming &&
        !c.callkeepAlreadyRejected &&
        (!c.callkeepUuid || c.callkeepUuid === uuid) &&
        (o?.includingAnswered
          ? true
          : !c.answered && !c.callkeepAlreadyAnswered),
    )
  onCallKeepDidDisplayIncomingCall = (uuid: string) => {
    // Find the current incoming call which is not callkeep
    const c = this.getIncomingCallkeep(uuid)
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
    // Allow 1 ringing callkeep only
    if (this.prevCallKeepUuid) {
      const prevCall = this.calls.find(
        c => c.callkeepUuid === this.prevCallKeepUuid,
      )
      if (prevCall) {
        prevCall.callkeepAlreadyRejected = true
      }
      endCallKeep(this.prevCallKeepUuid)
    }
    this.prevCallKeepUuid = uuid
    // New timeout logic
    setAutoEndCallKeepTimer(uuid)
  }
  onCallKeepAnswerCall = (uuid: string) => {
    const c = this.getIncomingCallkeep(uuid)
    if (c && !c.callkeepAlreadyAnswered) {
      c.callkeepAlreadyAnswered = true
      c.answer()
      console.error('SIP PN debug: answer by onCallKeepAnswerCall')
    } else if (this.recentPn?.uuid === uuid) {
      this.recentPn.action = 'answered'
    }
  }
  onCallKeepEndCall = (uuid: string) => {
    const c = this.getIncomingCallkeep(uuid, {
      includingAnswered: true,
    })
    if (c) {
      c.callkeepAlreadyRejected = true
      c.hangup()
      console.error('SIP PN debug: reject by onCallKeepEndCall')
    } else if (this.recentPn?.uuid === uuid) {
      this.recentPn.action = 'rejected'
    }
    if (this.prevCallKeepUuid === uuid) {
      this.prevCallKeepUuid = undefined
    }
  }

  endCallKeep = (
    // To keep reference on the Call type, use Pick
    c?: Pick<Call, 'callkeepUuid'> &
      Partial<Pick<Call, 'callkeepAlreadyRejected'>>,
  ) => {
    this.recentPn = undefined
    if (c?.callkeepUuid) {
      const uuid = c.callkeepUuid
      c.callkeepUuid = ''
      c.callkeepAlreadyRejected = true
      endCallKeep(uuid)
    }
  }

  @observable calls: Call[] = []
  @computed get incomingCall() {
    return this.calls.find(c => c.incoming && !c.answered)
  }
  @observable currentCallId?: string = undefined
  @computed get currentCall() {
    this.updateCurrentCallDebounce()
    return this.calls.find(c => c.id === this.currentCallId)
  }
  @computed get backgroundCalls() {
    return this.calls.filter(
      c => c.id !== this.currentCallId && (!c.incoming || c.answered),
    )
  }

  @action upsertCall = (
    cPartial: Pick<Call, 'id'> & Partial<Omit<Call, 'id'>>,
  ) => {
    this.recentCallActivityAt = Date.now()
    const cExisting = this.calls.find(c => c.id === cPartial.id)
    if (cExisting) {
      if (!cExisting.answered && cPartial.answered) {
        cPartial.answeredAt = Date.now()
      }
      Object.assign(cExisting, cPartial)
      return
    }
    // Construct a new call
    const c = new Call(this)
    Object.assign(c, cPartial)
    this.calls = [c, ...this.calls]
    // Get and check callkeep
    let recentPnUuid = ''
    let recentPnAction = ''
    if (this.recentPn && Date.now() - this.recentPn.at < 20000) {
      recentPnUuid = this.recentPn.uuid
      recentPnAction = this.recentPn.action || ''
    }
    if (Platform.OS === 'web' || !recentPnUuid || !c.incoming || c.answered) {
      return
    }
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
      c.hangup()
      console.error('SIP PN debug: reject by recentPnAction')
    }
  }
  @action removeCall = (id: string) => {
    this.recentCallActivityAt = Date.now()
    const c = this.calls.find(c => c.id === id)
    if (c) {
      getAuthStore().pushRecentCall({
        id: uuid(),
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
    this.endCallKeep(c)
    if (!this.calls.length && Platform.OS !== 'web') {
      this.isLoudSpeakerEnabled = false
      IncallManager.setForceSpeakerphoneOn(false)
    }
  }

  @action selectBackgroundCall = (c: Call) => {
    if (c.holding) {
      c.toggleHold()
    }
    this.currentCallId = c.id
    Nav().backToPageBackgroundCalls()
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
    const startCall = async (isReconnect?: boolean) => {
      if (isReconnect) {
        // Do not call sip too frequencely on reconnect
        await waitTimeout(3000)
      }
      await pbx.getConfig()
      sip.createSession(number, options)
    }
    try {
      await startCall()
    } catch (err) {
      reconnectAndWaitSip(startCall)
      reconnectCalled = true
    }
    Nav().goToPageCallManage()
    // Auto update currentCallId
    this.currentCallId = undefined
    const prevIds = arrToMap(this.calls, 'id') as { [k: string]: boolean }
    this.clearStartCallIntervalTimer()
    this.startCallIntervalAt = Date.now()
    // Start call logic in RNCallKeep
    let newUuid = ''
    if (Platform.OS === 'ios') {
      newUuid = uuid().toUpperCase()
      RNCallKeep.startCall(newUuid, number, 'Brekeke Phone')
      RNCallKeep.reportConnectingOutgoingCallWithUUID(newUuid)
      setAutoEndCallKeepTimer(newUuid)
    }
    this.startCallIntervalId = BackgroundTimer.setInterval(() => {
      const currentCall = this.calls.find(c => !prevIds[c.id])
      if (currentCall) {
        if (newUuid) {
          currentCall.callkeepUuid = newUuid
          RNCallKeep.reportConnectedOutgoingCallWithUUID(newUuid)
        }
        this.currentCallId = currentCall.id
        this.clearStartCallIntervalTimer()
        return
      }
      // Add a guard of 10s to clear the interval
      if (Date.now() - this.startCallIntervalAt > 10000) {
        if (newUuid) {
          RNCallKeep.endCall(newUuid)
        }
        this.clearStartCallIntervalTimer()
        return
      }
      // If after 3s and there's no call in the store
      // It's likely a connection issue occurred
      if (
        !currentCall &&
        !reconnectCalled &&
        Date.now() - this.startCallIntervalAt > 3000
      ) {
        reconnectAndWaitSip(startCall)
      }
    }, 500)
  }

  startVideoCall = (number: string) => {
    this.startCall(number, {
      videoEnabled: true,
    })
  }

  private updateCurrentCall = () => {
    let currentCall: Call | undefined
    if (this.calls.length) {
      currentCall =
        this.calls.find(c => c.id === this.currentCallId) ||
        this.calls.find(c => c.answered && !c.holding) ||
        this.calls[0]
    }
    const currentCallId = currentCall?.id
    if (currentCallId !== this.currentCallId) {
      BackgroundTimer.setTimeout(
        action(() => (this.currentCallId = currentCallId)),
        300,
      )
    }
    this.updateBackgroundCallsDebounce()
  }
  private updateCurrentCallDebounce = debounce(this.updateCurrentCall, 500, {
    maxWait: 1000,
  })
  @action private updateBackgroundCalls = () => {
    // Auto hold background calls
    this.calls
      .filter(
        c =>
          c.id !== this.currentCallId &&
          c.answered &&
          !c.transferring &&
          !c.holding,
      )
      .forEach(c => c.toggleHold())
  }
  private updateBackgroundCallsDebounce = debounce(
    this.updateBackgroundCalls,
    500,
    {
      maxWait: 1000,
    },
  )

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

let callkeepMap: {
  [uuid: string]: {
    uuid: string
    at: number
  }
} = {}
let totalEmptyCallsAttempt = 0
let autoEndCallKeepTimerId = 0
const clearAutoEndCallKeepTimer = () => {
  if (Platform.OS === 'web' || !autoEndCallKeepTimerId) {
    return
  }
  totalEmptyCallsAttempt = 0
  BackgroundTimer.clearInterval(autoEndCallKeepTimerId)
  autoEndCallKeepTimerId = 0
}
const setAutoEndCallKeepTimer = (uuid: string) => {
  if (Platform.OS === 'web') {
    return
  }
  callkeepMap[uuid] = {
    uuid,
    at: Date.now(),
  }

  clearAutoEndCallKeepTimer()
  autoEndCallKeepTimerId = BackgroundTimer.setInterval(() => {
    const n = Date.now()
    if (
      !callStore.calls.length &&
      (!callStore.recentPn || n - callStore.recentPn.at > 20000)
    ) {
      callkeepMap = {}
    } else {
      const prev = callStore.prevCallKeepUuid
      Object.values(callkeepMap).forEach(k => {
        const d2 = n - k.at
        const c = callStore.calls.find(c => c.callkeepUuid === k.uuid)
        if ((d2 > 20000 && !c) || (prev && prev !== k.uuid)) {
          if (c) {
            c.callkeepUuid = ''
            c.callkeepAlreadyRejected = true
          }
          endCallKeep(k.uuid)
          if (prev === k.uuid) {
            callStore.recentPn = undefined
          }
        }
      })
    }
    if (!Object.keys(callkeepMap).length) {
      totalEmptyCallsAttempt += 1
      const endAllCalls = () => {
        if (totalEmptyCallsAttempt > 2) {
          clearAutoEndCallKeepTimer()
        }
        RNCallKeep.endAllCalls()
      }
      if (Platform.OS === 'ios') {
        endAllCalls()
      } else if (
        callStore.recentPn?.action !== 'answered' &&
        !callStore.calls.find(c => c.answered || c.callkeepAlreadyAnswered)
      ) {
        endAllCalls()
        IncomingCall.closeIncomingCallActivity()
      }
    }
  }, 1000)
}
const endCallKeep = (uuid: string) => {
  delete callkeepMap[uuid]
  const n = Date.now()
  if (
    !callStore.calls.length &&
    (!callStore.recentPn || n - callStore.recentPn.at > 20000)
  ) {
    RNCallKeep.endAllCalls()
    callStore.recentPn = undefined
  } else {
    RNCallKeep.rejectCall(uuid)
    RNCallKeep.endCall(uuid)
  }
  RNCallKeep.reportEndCallWithUUID(
    uuid,
    CONSTANTS.END_CALL_REASONS.REMOTE_ENDED,
  )
}

export default callStore
