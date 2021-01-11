import debounce from 'lodash/debounce'
import { action, computed, observable } from 'mobx'
import moment from 'moment'
import { Platform } from 'react-native'
import BackgroundTimer from 'react-native-background-timer'
import RNCallKeep from 'react-native-callkeep'
import IncallManager from 'react-native-incall-manager'
import { v4 as uuid } from 'react-native-uuid'

import pbx from '../api/pbx'
import sip from '../api/sip'
import { RnNativeModules } from '../utils/RnNativeModules'
import { arrToMap } from '../utils/toMap'
import { getAuthStore } from './authStore'
import Call from './Call'
import Nav from './Nav'
import { reconnectAndWaitSip } from './reconnectAndWaitSip'

export class CallStore {
  private recentPn?: {
    uuid: string
    at: number
    action?: 'answered' | 'rejected'
  }
  recentCallActivityAt = 0

  private autoEndCallKeepTimerId = 0
  private clearAutoEndCallKeepTimer = () => {
    if (this.autoEndCallKeepTimerId) {
      BackgroundTimer.clearTimeout(this.autoEndCallKeepTimerId)
      this.autoEndCallKeepTimerId = 0
    }
  }
  private getIncomingEmptyCallkeep = (uuid: string) =>
    this.calls.find(
      c =>
        c.incoming &&
        !c.answered &&
        !c.callkeepAlreadyHandled &&
        (!c.callkeepUuid || c.callkeepUuid === uuid),
    )
  onCallKeepDidDisplayIncomingCall = (uuid: string) => {
    // Always end the call if it rings too long > 20s without picking up
    this.clearAutoEndCallKeepTimer()
    this.autoEndCallKeepTimerId = BackgroundTimer.setTimeout(() => {
      const c = this.calls.find(c => c.callkeepUuid === uuid && !c.answered)
      if (c) {
        c.hangup()
      } else {
        RNCallKeep.endCall(uuid)
        RnNativeModules.IncomingCall.closeIncomingCallActivity()
      }
    }, 20000)
    // Find the current incoming call which is not callkeep
    const c = this.getIncomingEmptyCallkeep(uuid)
    if (c?.answered) {
      // If the call is existing and already answered, can end the callkeep displaying
      // We assume that the app is being used in foreground (not quite exactly but assume)
      RNCallKeep.endCall(uuid)
    } else if (c) {
      // If the call is existing and not answered yet, we'll mark that call as displaying in callkeep
      // We assume that the app is being used in foreground (not quite exactly but assume)
      c.callkeepUuid = uuid
      RNCallKeep.updateDisplay(uuid, c.partyName, 'Brekeke Phone', {
        hasVideo: c.remoteVideoEnabled,
      })
    } else {
      // Otherwise save the data for later process
      this.recentPn = {
        uuid,
        at: Date.now(),
      }
    }
  }
  onCallKeepAnswerCall = (uuid: string) => {
    const c = this.getIncomingEmptyCallkeep(uuid)
    if (c) {
      this.answerCall(c)
      c.callkeepAlreadyHandled = true
    } else {
      if (this.recentPn) {
        this.recentPn.action = 'answered'
      }
      RNCallKeep.endCall(uuid)
    }
    this.clearAutoEndCallKeepTimer()
  }
  onCallKeepEndCall = (uuid: string) => {
    const c = this.getIncomingEmptyCallkeep(uuid)
    if (c) {
      c.hangup()
      c.callkeepAlreadyHandled = true
    } else if (this.recentPn && !this.recentPn.action) {
      this.recentPn.action = 'rejected'
    }
    this.clearAutoEndCallKeepTimer()
  }

  endCallKeep = (c?: Call) => {
    this.recentPn = undefined
    if (c?.callkeepUuid) {
      const uuid = c.callkeepUuid
      c.callkeepUuid = ''
      c.callkeepAlreadyHandled = true
      RNCallKeep.endCall(uuid)
    }
    RnNativeModules.IncomingCall.closeIncomingCallActivity()
    this.clearAutoEndCallKeepTimer()
  }

  @observable calls: Call[] = []
  @computed get incomingCall() {
    return this.calls.find(c => c.incoming && !c.answered)
  }
  @observable private currentCallId?: string = undefined
  @computed get currentCall() {
    this.updateCurrentCallDebounce()
    return this.calls.find(c => c.id === this.currentCallId)
  }
  @computed get backgroundCalls() {
    return this.calls.filter(
      c => c.id !== this.currentCallId && (!c.incoming || c.answered),
    )
  }

  @action upsertCall = (cPartial: { id: string }) => {
    this.recentCallActivityAt = Date.now()
    const cExisting = this.calls.find(c => c.id === cPartial.id)
    if (cExisting) {
      Object.assign(cExisting, cPartial)
      if (cExisting.callkeepUuid && cExisting.answered) {
        this.endCallKeep(cExisting)
      }
      return
    }
    // Construct a new call
    const c = new Call(this)
    Object.assign(c, cPartial)
    this.calls = [c, ...this.calls]
    // Check and assign callkeep uuid
    let recentPnUuid = ''
    let recentPnAction: string | undefined
    if (this.recentPn && Date.now() - this.recentPn.at < 20000) {
      recentPnUuid = this.recentPn.uuid
      recentPnAction = this.recentPn.action
    }
    if (recentPnUuid) {
      c.callkeepUuid = recentPnUuid
    }
    // Check the case which is not PN incoming call
    if (!c.incoming || Platform.OS === 'web') {
      return
    }
    if (c.answered || !recentPnUuid) {
      this.endCallKeep(c)
      return
    }
    // Handle PN logic
    if (recentPnAction) {
      c.callkeepAlreadyHandled = true
      this.endCallKeep(c)
    }
    if (recentPnAction === 'answered') {
      this.answerCall(c)
    } else if (recentPnAction === 'rejected') {
      c.hangup()
    } else {
      RNCallKeep.updateDisplay(recentPnUuid, c.partyName, 'Brekeke Phone', {
        hasVideo: c.remoteVideoEnabled,
      })
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
    }
    this.calls = this.calls.filter(c => c.id !== id)
    this.endCallKeep(c)
  }

  @action selectBackgroundCall = (c: Call) => {
    if (c.holding) {
      c.toggleHold()
    }
    this.currentCallId = c.id
    Nav().backToPageBackgroundCalls()
  }

  @action answerCall = (c: Call, options?: object) => {
    c.answered = true
    this.currentCallId = c.id
    sip.answerSession(c.id, {
      videoEnabled: c.remoteVideoEnabled,
      ...options,
    })
    Nav().goToPageCallManage()
    this.endCallKeep(c)
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
    const startCall = async () => {
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
    // Auto update _currentCallId
    this.currentCallId = undefined
    const prevIds = arrToMap(this.calls, 'id') as { [k: string]: boolean }
    this.clearStartCallIntervalTimer()
    this.startCallIntervalAt = Date.now()
    this.startCallIntervalId = BackgroundTimer.setInterval(() => {
      const currentCallId = this.calls.map(c => c.id).find(id => !prevIds[id])
      // If after 3s and there's no call in the store
      // It's likely a connection issue occurred
      if (
        !reconnectCalled &&
        !currentCallId &&
        Date.now() - this.startCallIntervalAt > 3000
      ) {
        this.clearStartCallIntervalTimer()
        reconnectAndWaitSip(startCall)
        return
      }
      if (currentCallId) {
        this.currentCallId = currentCallId
      }
      // Add a guard of 10s to clear the interval
      if (currentCallId || Date.now() - this.startCallIntervalAt > 10000) {
        this.clearStartCallIntervalTimer()
      }
    }, 100)
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

if (Platform.OS !== 'web') {
  // autorun(() => {
  //   // TODO speaker
  //   // https://github.com/react-native-webrtc/react-native-callkeep/issues/78
  // })
}

export default callStore
