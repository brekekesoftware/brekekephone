import { action, computed, observable } from 'mobx'
import RNCallKeep from 'react-native-callkeep'

import pbx from '../api/pbx'
import sip from '../api/sip'
import { IncomingCall } from '../utils/RnNativeModules'
import { CallStore } from './callStore'
import { intlDebug } from './intl'
import Nav from './Nav'
import RnAlert from './RnAlert'
import timerStore from './timerStore'

export default class Call {
  constructor(private store: CallStore) {}

  @observable id = ''
  @observable pnId = ''
  @observable partyNumber = ''
  @observable partyName = ''
  @observable pbxTalkerId = ''
  @observable pbxTenant = ''
  @computed get title() {
    return this.partyName || this.partyNumber || this.pbxTalkerId || this.id
  }

  @observable incoming = false
  @observable answered = false
  @observable answeredAt = 0
  @computed get duration() {
    return this.answeredAt && timerStore.now - this.answeredAt
  }

  callkeepUuid = ''
  callkeepAlreadyAnswered = false
  callkeepAlreadyRejected = false

  answer = (options?: object) => {
    this.answered = true
    this.store.currentCallId = this.id
    // Hold other calls
    this.store.calls
      .filter(c => c.id !== this.id && c.answered && !c.holding)
      .forEach(c => c.toggleHold())
    sip.answerSession(this.id, {
      videoEnabled: this.remoteVideoEnabled,
      ...options,
    })
    Nav().goToPageCallManage()
    if (this.callkeepUuid && !this.callkeepAlreadyAnswered) {
      RNCallKeep.answerIncomingCall(this.callkeepUuid)
    }
  }

  hangup = () => {
    sip.hangupSession(this.id)
    this.store.endCallKeep(this)
  }
  hangupWithUnhold = () =>
    this.holding ? this.toggleHold().then(this.hangup) : this.hangup()

  @observable videoSessionId = ''
  @observable localVideoEnabled = false
  @observable remoteVideoEnabled = false
  enableVideo = () => sip.enableVideo(this.id)
  disableVideo = () => sip.disableVideo(this.id)
  toggleVideo = () =>
    this.localVideoEnabled ? this.disableVideo() : this.enableVideo()

  @observable remoteVideoStreamObject: MediaStream | null = null
  voiceStreamObject: MediaStream | null = null

  @observable muted = false
  @action toggleMuted = () => {
    this.muted = !this.muted
    if (this.callkeepUuid) {
      RNCallKeep.setMutedCall(this.callkeepUuid, this.muted)
    }
    return sip.setMuted(this.muted, this.id)
  }

  @observable recording = false
  @action toggleRecording = () => {
    this.recording = !this.recording
    return pbx
      .startRecordingTalker(this.pbxTenant, this.pbxTalkerId)
      .then(this.onToggleRecordingFailure)
      .catch(this.onToggleRecordingFailure)
  }
  @action private onToggleRecordingFailure = (err: Error | boolean) => {
    if (typeof err !== 'boolean' || !err) {
      this.recording = !this.recording
    }
    if (typeof err !== 'boolean') {
      const message = this.recording
        ? intlDebug`Failed to stop recording the call`
        : intlDebug`Failed to start recording the call`
      RnAlert.error({ message, err })
    }
  }

  @observable holding = false
  @action toggleHold = () => {
    this.holding = !this.holding
    if (this.callkeepUuid && !this.holding) {
      // Hack to fix no voice after unhold: only setOnHold in unhold case
      RNCallKeep.setOnHold(this.callkeepUuid, false)
    }
    IncomingCall.setOnHold(this.callkeepUuid, this.holding)
    const fn = this.holding ? pbx.holdTalker : pbx.unholdTalker
    return fn(this.pbxTenant, this.pbxTalkerId)
      .then(this.onToggleHoldFailure)
      .catch(this.onToggleHoldFailure)
  }
  @action private onToggleHoldFailure = (err: Error | boolean) => {
    if (typeof err !== 'boolean' || !err) {
      this.holding = !this.holding
      if (this.callkeepUuid && !this.holding) {
        // Hack to fix no voice after unhold: only setOnHold in unhold case
        RNCallKeep.setOnHold(this.callkeepUuid, false)
      }
      IncomingCall.setOnHold(this.callkeepUuid, this.holding)
    }
    if (typeof err !== 'boolean') {
      const message = this.holding
        ? intlDebug`Failed to unhold the call`
        : intlDebug`Failed to hold the call`
      RnAlert.error({ message, err })
    }
  }

  @observable transferring = ''
  private prevTransferring = ''
  transferBlind = (number: string) => {
    Nav().goToPageCallRecents()
    return pbx
      .transferTalkerBlind(this.pbxTenant, this.pbxTalkerId, number)
      .catch(this.onTransferFailure)
  }
  @action transferAttended = (number: string) => {
    this.transferring = number
    Nav().backToPageCallManage()
    return pbx
      .transferTalkerAttended(this.pbxTenant, this.pbxTalkerId, number)
      .catch(this.onTransferFailure)
  }
  @action private onTransferFailure = (err: Error) => {
    this.transferring = ''
    RnAlert.error({
      message: intlDebug`Failed to transfer the call`,
      err,
    })
  }

  @action stopTransferring = () => {
    this.prevTransferring = this.transferring
    this.transferring = ''
    return pbx
      .stopTalkerTransfer(this.pbxTenant, this.pbxTalkerId)
      .catch(this.onStopTransferringFailure)
  }
  @action private onStopTransferringFailure = (err: Error) => {
    this.transferring = this.prevTransferring
    RnAlert.error({
      message: intlDebug`Failed to stop the transfer`,
      err,
    })
  }

  @action conferenceTransferring = () => {
    this.prevTransferring = this.transferring
    this.transferring = ''
    return pbx
      .joinTalkerTransfer(this.pbxTenant, this.pbxTalkerId)
      .catch(this.onConferenceTransferringFailure)
  }
  @action private onConferenceTransferringFailure = (err: Error) => {
    this.transferring = this.prevTransferring
    RnAlert.error({
      message: intlDebug`Failed to make conference for the transfer`,
      err,
    })
  }

  @action park = (number: string) => {
    return pbx
      .parkTalker(this.pbxTenant, this.pbxTalkerId, number)
      .catch(this.onParkFailure)
  }
  private onParkFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to park the call`,
      err,
    })
  }
}
