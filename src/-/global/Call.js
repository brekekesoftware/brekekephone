import { action, computed, observable } from 'mobx'
import { NativeModules, Platform } from 'react-native'
import RNCallKeep from 'react-native-callkeep'
import { v4 as uuid } from 'react-native-uuid'

import pbx from '../api/pbx'
import sip from '../api/sip'
import { intlDebug } from '../intl/intl'
import g from '.'

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

  @observable createdAt = Date.now()
  @observable duration = 0

  hangup = () => {
    sip.hangupSession(this.id)
    if (Platform.OS === 'android') {
      NativeModules.ActivityStarter.closeMyActivity()
    }
  }
  hangupWithUnhold = () =>
    this.holding ? this.toggleHold().then(this.hangup) : this.hangup()

  @observable videoSessionId = ''
  @observable localVideoEnabled = false
  @observable remoteVideoEnabled = false
  enableVideo = () => sip.enableVideo(this.id)
  disableVideo = () => sip.disableVideo(this.id)

  @observable remoteVideoStreamObject = null
  voiceStreamObject = null

  @observable muted = false
  @action toggleMuted = fromCallkeep => {
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
      .catch(this._onToggleRecordingFailure)
  }
  @action _onToggleRecordingFailure = err => {
    this.recording = !this.recording
    const message = this.recording
      ? intlDebug`Failed to stop recording the call`
      : intlDebug`Failed to start recording the call`
    g.showError({ message, err })
  }

  @observable holding = false
  @action toggleHold = fromCallkeep => {
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
      .catch(this._onToggleHoldFailure)
  }
  @action _onToggleHoldFailure = err => {
    this.holding = !this.holding
    const message = this.holding
      ? intlDebug`Failed to unhold the call`
      : intlDebug`Failed to hold the call`
    g.showError({ message, err })
  }

  @observable transferring = ''
  _prevTransferring = ''
  transferBlind = number => {
    g.backToPageCallManage()
    return pbx
      .transferTalkerBlind(this.pbxTenant, this.pbxTalkerId, number)
      .catch(this._onTransferFailure)
  }
  @action transferAttended = number => {
    this.transferring = number
    g.backToPageCallManage()
    return pbx
      .transferTalkerAttended(this.pbxTenant, this.pbxTalkerId, number)
      .catch(this._onTransferFailure)
  }
  @action _onTransferFailure = err => {
    this.transferring = ''
    g.showError({
      message: intlDebug`Failed to transfer the call`,
      err,
    })
  }

  @action stopTransferring = () => {
    this._prevTransferring = this.transferring
    this.transferring = ''
    return pbx
      .stopTalkerTransfer(this.pbxTenant, this.pbxTalkerId)
      .catch(this._onStopTransferringFailure)
  }
  @action _onStopTransferringFailure = err => {
    this.transferring = this._prevTransferring
    g.showError({
      message: intlDebug`Failed to stop the transfer`,
      err,
    })
  }

  @action conferenceTransferring = () => {
    this._prevTransferring = this.transferring
    this.transferring = ''
    return pbx
      .joinTalkerTransfer(this.pbxTenant, this.pbxTalkerId)
      .catch(this._onConferenceTransferringFailure)
  }
  @action _onConferenceTransferringFailure = err => {
    this.transferring = this._prevTransferring
    g.showError({
      message: intlDebug`Failed to make conference for the transfer`,
      err,
    })
  }

  @action park = number => {
    return pbx
      .parkTalker(this.pbxTenant, this.pbxTalkerId, number)
      .catch(this._onParkFailure)
  }
  _onParkFailure = err => {
    g.showError({
      message: intlDebug`Failed to park the call`,
      err,
    })
  }
}
