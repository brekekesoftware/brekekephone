import debounce from 'lodash/debounce'
import { action, computed, observable } from 'mobx'
import { AppState, Platform } from 'react-native'
import RNCallKeep from 'react-native-callkeep'
import IncallManager from 'react-native-incall-manager'

import sip from '../api/sip'
import { arrToMap } from '../utils/toMap'
import g from '.'
import Call from './Call'

export const uuidFromPushKit = '00000000-0000-0000-0000-000000000000'

export class CallStore {
  constructor() {
    this._initDurationInterval()
  }

  recentPushKit = ''
  recentPushKitAt = 0

  @observable _calls = []
  @observable _currentCallId = undefined
  @computed get incomingCall() {
    return this._calls.find(c => c.incoming && !c.answered)
  }
  @computed get currentCall() {
    this._updateCurrentCallDebounce()
    return this._calls.find(c => c.id === this._currentCallId)
  }
  @computed get backgroundCalls() {
    return this._calls.filter(
      c => c.id !== this._currentCallId && !(c.incoming && !c.answered),
    )
  }

  _updateCurrentCall = () => {
    let currentCall
    if (this._calls.length) {
      currentCall =
        this._calls.find(c => c.id === this._currentCallId) ||
        this._calls.find(c => c.answered && !c.holding) ||
        this._calls[0]
    }
    const currentCallId = currentCall?.id || undefined
    if (currentCallId !== this._currentCallId) {
      setTimeout(action(() => (this._currentCallId = currentCallId)))
    }
    this._updateBackgroundCallsDebounce()
  }
  _updateCurrentCallDebounce = debounce(this._updateCurrentCall, 500, {
    maxWait: 1000,
  })
  @action _updateBackgroundCalls = () => {
    // Auto hold background calls
    this._calls
      .filter(
        c =>
          c.id !== this._currentCallId &&
          c.answered &&
          !c.transferring &&
          !c.holding,
      )
      .forEach(c => c.toggleHold())
  }
  _updateBackgroundCallsDebounce = debounce(this._updateBackgroundCalls, 500, {
    maxWait: 1000,
  })

  @action upsertCall = _c => {
    let c = this._calls.find(c => c.id === _c.id)
    if (!c) {
      c = new Call()
      Object.assign(c, _c)
      this._calls = [c, ...this._calls]
      //
      if (c.incoming && !c.answered) {
        const recentPushKit =
          Date.now() - this.recentPushKitAt < 20000 && this.recentPushKit
        this.recentPushKit = ''
        this.recentPushKitAt = 0
        //
        if (recentPushKit === 'answered') {
          this.answerCall(c)
        } else if (recentPushKit === 'rejected') {
          c.hangup()
        } else if (
          Platform.OS === 'ios' ||
          (Platform.OS === 'android' && AppState.currentState !== 'active')
        ) {
          c.callkeep = true
          RNCallKeep.displayIncomingCall(c.uuid, 'Brekeke Phone', c.partyNumber)
        }
        if (Platform.OS === 'ios') {
          setTimeout(() => RNCallKeep.endCall(uuidFromPushKit), 1000)
        }
      }
    } else {
      Object.assign(c, _c)
    }
  }
  @action removeCall = id => {
    const c = this._calls.find(c => c.id === id)
    this._calls = this._calls.filter(c => c.id !== id)
    if (c?.callkeep) {
      RNCallKeep.endCall(c.uuid)
    }
  }

  findByUuid = uuid => this._calls.find(c => c.uuid === uuid)
  @action removeByUuid = uuid => {
    this._calls = this._calls.filter(c => c.uuid !== uuid)
  }

  @action selectBackgroundCall = c => {
    if (c.holding) {
      c.toggleHold()
    }
    this._currentCallId = c.id
    g.backToPageBackgroundCalls()
  }

  @action answerCall = (c, options) => {
    this._currentCallId = c.id
    sip.answerSession(c.id, {
      videoEnabled: c.remoteVideoEnabled,
      ...options,
    })
    g.goToPageCallManage()
  }

  _startCallIntervalAt = 0
  _startCallIntervalId = 0
  startCall = (number, options) => {
    sip.createSession(number, options)
    g.goToPageCallManage()
    // Auto update _currentCallId
    this._currentCallId = undefined
    const prevIds = arrToMap(this._calls, 'id')
    if (this._startCallIntervalId) {
      clearInterval(this._startCallIntervalId)
    }
    this._startCallIntervalAt = Date.now()
    this._startCallIntervalId = setInterval(() => {
      const currentCallId = this._calls.map(c => c.id).find(id => !prevIds[id])
      if (currentCallId) {
        this._currentCallId = currentCallId
      }
      if (currentCallId || Date.now() > this._startCallIntervalAt + 10000) {
        clearInterval(this._startCallIntervalId)
        this._startCallIntervalId = 0
      }
    }, 100)
  }

  startVideoCall = number => {
    this.startCall(number, {
      videoEnabled: true,
    })
  }

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

  _durationIntervalId = 0
  _initDurationInterval = () => {
    this._durationIntervalId = setInterval(this._updateDuration, 100)
  }
  @action _updateDuration = () => {
    this._calls
      .filter(c => c.answered)
      .forEach(c => {
        c.duration += 100
      })
  }

  dispose = () => {
    if (this._startCallIntervalId) {
      clearInterval(this._startCallIntervalId)
      this._startCallIntervalId = 0
    }
    // Dont need to dispose duration interval id
    // Because the store is currently global static
  }
}

const callStore = new CallStore()

if (Platform.OS !== 'web') {
  // autorun(() => {
  //   // TODO speaker
  //   // https://github.com/react-native-webrtc/react-native-callkeep/issues/78
  // })

  // End all callkeep when app active
  AppState.addEventListener('change', () => {
    if (AppState.currentState === 'active') {
      callStore._calls
        .filter(c => c.callkeep)
        .forEach(c => {
          c.callkeep = false
          RNCallKeep.endCall(c.uuid)
        })
    }
  })
}

export default callStore
