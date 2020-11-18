import { action, computed, observable } from 'mobx'
import { NativeModule, NativeModules, Platform } from 'react-native'
import RNCallKeep from 'react-native-callkeep'
import { v4 as uuid } from 'react-native-uuid'

import pbx from '../api/pbx'
import sip from '../api/sip'
import { intlDebug } from './intl'
import Nav from './Nav'
import RnAlert from './RnAlert'

export const NativeModules0 = NativeModules as {
  IncomingCall: NativeModule & {
    closeIncomingCallActivity(): void
    showCall(uuid: string, callerName: string, withVideo?: boolean): void
  }
}

export default class Call {
  @observable id = ''
  @observable partyNumber = ''
  @observable partyName = ''
  @observable pbxTalkerId = ''
  @observable pbxTenant = ''
  @computed get title() {
    return this.partyName || this.partyNumber || this.pbxTalkerId || this.id
  }

  uuid = uuid()
  callkeep = false
  callkeepDisplayed = false

  @observable incoming = false
  @observable answered = false
  rejected = false

  @observable createdAt = Date.now()
  @observable duration = 0

  hangup = () => {
    this.rejected = true
    sip.hangupSession(this.id)
    if (Platform.OS === 'android') {
      NativeModules0.IncomingCall.closeIncomingCallActivity()
    }
  }
  hangupWithUnhold = () =>
    this.holding ? this.toggleHold().then(this.hangup) : this.hangup()

  @observable videoSessionId = ''
  @observable localVideoEnabled = false
  @observable remoteVideoEnabled = false
  enableVideo = () => sip.enableVideo(this.id)
  disableVideo = () => sip.disableVideo(this.id)

  @observable remoteVideoStreamObject: MediaStream | null = null
  voiceStreamObject: MediaStream | null = null

  @observable muted = false
  @action toggleMuted = (fromCallkeep?: boolean) => {
    this.muted = !this.muted
    if (this.callkeep && !fromCallkeep) {
      RNCallKeep.setMutedCall(this.uuid, this.muted)
    }
    return sip.setMuted(this.muted, this.id)
  }

  @observable recording = false
  @action toggleRecording = () => {
    this.recording = !this.recording
    return pbx
      .startRecordingTalker(this.pbxTenant, this.pbxTalkerId)
      .catch(this.onToggleRecordingFailure)
  }
  @action private onToggleRecordingFailure = (err: Error) => {
    this.recording = !this.recording
    const message = this.recording
      ? intlDebug`Failed to stop recording the call`
      : intlDebug`Failed to start recording the call`
    RnAlert.error({ message, err })
  }

  @observable holding = false
  @action toggleHold = (fromCallkeep?: boolean) => {
    this.holding = !this.holding
    return pbx[this.holding ? 'holdTalker' : 'unholdTalker'](
      this.pbxTenant,
      this.pbxTalkerId,
    )
      .then(() => {
        if (this.callkeep && !fromCallkeep) {
          RNCallKeep.setOnHold(this.uuid, this.holding)
        }
      })
      .catch(this.onToggleHoldFailure)
  }
  @action private onToggleHoldFailure = (err: Error) => {
    this.holding = !this.holding
    const message = this.holding
      ? intlDebug`Failed to unhold the call`
      : intlDebug`Failed to hold the call`
    RnAlert.error({ message, err })
  }

  @observable transferring = ''
  private prevTransferring = ''
  transferBlind = (number: string) => {
    Nav().backToPageCallManage()
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
