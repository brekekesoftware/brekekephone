import { action, computed, observable } from 'mobx'
import { Platform } from 'react-native'
import RNCallKeep from 'react-native-callkeep'

import { pbx } from '../api/pbx'
import { sip } from '../api/sip'
import { IncomingCall } from '../utils/RnNativeModules'
import { waitTimeout } from '../utils/waitTimeout'
import { CallStore } from './callStore'
import { contactStore } from './contactStore'
import { intlDebug } from './intl'
import { Nav } from './Nav'
import { RnAlert } from './RnAlert'

export class Call {
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
  getDuration = () => this.answeredAt && Date.now() - this.answeredAt

  callkeepUuid = ''
  callkeepAlreadyAnswered = false
  callkeepAlreadyRejected = false

  @action
  answer = (ignoreNav?: boolean) => {
    this.answered = true
    this.store.currentCallId = this.id
    // Hold other calls
    this.store.calls
      .filter(c => c.id !== this.id && c.answered && !c.holding)
      .forEach(c => c.toggleHoldWithCheck())
    sip.answerSession(this.id, {
      videoEnabled: this.remoteVideoEnabled,
    })
    if (Platform.OS === 'android') {
      IncomingCall.onConnectingCallSuccess(this.callkeepUuid)
    }
    if (!ignoreNav) {
      Nav().goToPageCallManage()
    }
    if (this.callkeepUuid && !this.callkeepAlreadyAnswered) {
      RNCallKeep.answerIncomingCall(this.callkeepUuid)
    }
  }

  isAboutToHangup = false
  hangupWithUnhold = async () => {
    if (this.isAboutToHangup) {
      return
    }
    this.isAboutToHangup = true
    if (this.holding) {
      await this.toggleHold().then(
        success =>
          !success &&
          console.error(
            'hangupWithUnhold: failed to unhold, possible issue with pbx connection',
          ),
      )
      await waitTimeout()
    }
    sip.hangupSession(this.id)
  }

  @observable videoSessionId = ''
  @observable localVideoEnabled = false
  @observable remoteVideoEnabled = false
  toggleVideo = () => {
    const pbxUser = contactStore.getPbxUserById(
      this.partyNumber || this.partyName,
    )
    const callerStatus = pbxUser?.talkers?.[0].status
    if (this.holding || callerStatus === 'holding') {
      return
    }
    this.localVideoEnabled
      ? sip.disableVideo(this.id)
      : sip.enableVideo(this.id)
  }

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
    const fn = this.recording
      ? pbx.stopRecordingTalker
      : pbx.startRecordingTalker
    this.recording = !this.recording
    return fn(this.pbxTenant, this.pbxTalkerId)
      .then(this.onToggleRecordingFailure)
      .catch(this.onToggleRecordingFailure)
  }
  @action private onToggleRecordingFailure = (err: Error | boolean) => {
    if (err === true) {
      return
    }
    this.recording = !this.recording
    if (typeof err !== 'boolean') {
      const message = this.recording
        ? intlDebug`Failed to stop recording the call`
        : intlDebug`Failed to start recording the call`
      RnAlert.error({ message, err })
    }
  }

  toggleHoldWithCheck = () => {
    if (this.isAboutToHangup) {
      return
    }
    this.toggleHold()
  }

  @observable holding = false
  private prevHoling = false

  @action private toggleHold = () => {
    const fn = this.holding ? pbx.unholdTalker : pbx.holdTalker
    this.holding = !this.holding
    if (!this.isAboutToHangup) {
      if (this.callkeepUuid && !this.holding) {
        // Hack to fix no voice after unhold: only setOnHold in unhold case
        RNCallKeep.setOnHold(this.callkeepUuid, false)
      }
      IncomingCall.setOnHold(this.callkeepUuid, this.holding)
    }
    return fn(this.pbxTenant, this.pbxTalkerId)
      .then(this.onToggleHoldFailure)
      .catch(this.onToggleHoldFailure)
  }
  @action private onToggleHoldFailure = (err: Error | boolean) => {
    if (err === true) {
      return true
    }
    this.holding = !this.holding
    if (this.callkeepUuid && !this.holding) {
      // Hack to fix no voice after unhold: only setOnHold in unhold case
      RNCallKeep.setOnHold(this.callkeepUuid, false)
    }
    IncomingCall.setOnHold(this.callkeepUuid, this.holding)
    if (typeof err !== 'boolean') {
      const message = this.holding
        ? intlDebug`Failed to unhold the call`
        : intlDebug`Failed to hold the call`
      RnAlert.error({ message, err })
      // Already show error, considered it's handled
      return true
    }
    return false
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
    // user cancel transfer and resume call => auto unhold
    this.prevHoling = this.holding
    this.holding = false
    return pbx
      .stopTalkerTransfer(this.pbxTenant, this.pbxTalkerId)
      .catch(this.onStopTransferringFailure)
  }
  @action private onStopTransferringFailure = (err: Error) => {
    this.transferring = this.prevTransferring
    this.holding = this.prevHoling
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
