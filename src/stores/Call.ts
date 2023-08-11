import { action, observable } from 'mobx'
import RNCallKeep from 'react-native-callkeep'

import { pbx } from '../api/pbx'
import { sip } from '../api/sip'
import { Session, SessionStatus } from '../brekekejs'
import { getPartyName } from '../stores/contactStore'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { waitTimeout } from '../utils/waitTimeout'
import { CallStore } from './callStore2'
import { contactStore } from './contactStore'
import { intlDebug } from './intl'
import { Nav } from './Nav'
import { RnAlert } from './RnAlert'

export class Call {
  constructor(private store: CallStore) {}

  rawSession?: Session

  @observable earlyMedia: MediaStream | null = null
  @observable withSDP: boolean = false
  @observable withSDPControls: boolean = false
  @observable sessionStatus: SessionStatus = 'dialing'
  @observable id = ''
  @observable pnId = ''
  @observable partyNumber = ''
  @observable partyImageUrl = ''
  @observable partyImageSize = ''
  @observable talkingImageUrl = ''
  /** @deprecated use below getDisplayName instead */
  @observable partyName = ''
  @observable pbxTenant = ''
  @observable pbxRoomId = ''
  @observable pbxTalkerId = ''
  @observable pbxUsername = ''
  @observable isFrontCamera = true
  @observable callConfig: CallConfig = {}

  getDisplayName = () =>
    getPartyName(this.partyNumber) ||
    this.partyName ||
    this.partyNumber ||
    this.pbxTalkerId ||
    this.id
  createdAt = Date.now()

  @observable incoming = false
  @observable answered = false
  @observable answeredAt = 0

  getDuration = () => this.answeredAt && Date.now() - this.answeredAt

  callkeepUuid = ''
  callkeepAlreadyAnswered = false
  callkeepAlreadyRejected = false

  @action
  answer = (
    options?: { ignoreNav?: boolean },
    videoOptions?: object,
    exInfo?: object,
  ) => {
    const ignoreNav = options?.ignoreNav
    if (options) {
      delete options.ignoreNav
    }
    this.answered = true
    sip.phone?.answer(
      this.id,
      options,
      this.remoteVideoEnabled,
      videoOptions,
      exInfo,
    )
    if (!ignoreNav) {
      Nav().goToPageCallManage()
    }
    this.answerCallKeep()
  }
  answerCallKeep = async () => {
    this.store.setCurrentCallId(this.id)
    if (!this.callkeepUuid) {
      return
    }
    this.callkeepAlreadyAnswered = true
    await waitTimeout()
    if (this.incoming) {
      RNCallKeep.answerIncomingCall(this.callkeepUuid)
    } else {
      RNCallKeep.reportConnectedOutgoingCallWithUUID(this.callkeepUuid)
    }
    RNCallKeep.setCurrentCallActive(this.callkeepUuid)
    RNCallKeep.setOnHold(this.callkeepUuid, false)
    BrekekeUtils.setOnHold(this.callkeepUuid, false)
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
    const pbxUser = contactStore.getPbxUserById(this.partyNumber)
    const callerStatus = pbxUser?.talkers?.[0]?.status
    if (this.holding || callerStatus === 'holding') {
      return
    }
    if (this.localVideoEnabled) {
      sip.disableVideo(this.id)
    } else {
      sip.enableVideo(this.id)
    }
  }
  @action toggleSwitchCamera = () => {
    this.isFrontCamera = !this.isFrontCamera
    sip.switchCamera(this.id, this.isFrontCamera)
    BrekekeUtils.setIsFrontCamera(this.callkeepUuid, this.isFrontCamera)
  }

  @observable remoteVideoStreamObject: MediaStream | null = null
  voiceStreamObject: MediaStream | null = null

  @observable muted = false
  @action toggleMuted = () => {
    this.muted = !this.muted
    if (this.callkeepUuid) {
      RNCallKeep.setMutedCall(this.callkeepUuid, this.muted)
      BrekekeUtils.setIsMute(this.callkeepUuid, this.muted)
    }
    return sip.setMuted(this.muted, this.id)
  }

  @observable recording = false
  @action updateRecordingStatus = (status: boolean) => {
    this.recording = status
    BrekekeUtils.setRecordingStatus(this.callkeepUuid, this.recording)
  }
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
  private prevHolding = false

  @action private toggleHold = () => {
    const fn = this.holding ? 'unhold' : 'hold'
    this.setHolding(fn === 'hold')
    if (!this.isAboutToHangup && fn === 'unhold') {
      this.store.setCurrentCallId(this.id)
    }
    return pbx[`${fn}Talker`](this.pbxTenant, this.pbxTalkerId)
      .then(this.onToggleHoldFailure)
      .catch(this.onToggleHoldFailure)
  }
  @action private onToggleHoldFailure = (err: Error | boolean) => {
    if (err === true) {
      return true
    }
    const prevFn = this.holding ? 'hold' : 'unhold'
    this.setHolding(prevFn === 'unhold')
    if (typeof err !== 'boolean') {
      const message =
        prevFn === 'unhold'
          ? intlDebug`Failed to unhold the call`
          : intlDebug`Failed to hold the call`
      RnAlert.error({ message, err })
      // already show error, considered it's handled
      return true
    }
    return false
  }

  private setHolding = (holding: boolean) => {
    this.holding = holding
    if (!this.callkeepUuid || this.isAboutToHangup) {
      return
    }
    // TODO
    // might need to check if there wont be multiple calls holding=false
    RNCallKeep.setOnHold(this.callkeepUuid, holding)
    BrekekeUtils.setOnHold(this.callkeepUuid, holding)
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
    // avoid issue no-voice if user set hold before
    this.setHolding(false)
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
    // user cancel transfer and resume call -> unhold automatically from server side
    this.setHolding(false)
    return pbx
      .stopTalkerTransfer(this.pbxTenant, this.pbxTalkerId)
      .catch(this.onStopTransferringFailure)
  }
  @action private onStopTransferringFailure = (err: Error) => {
    this.transferring = this.prevTransferring
    this.setHolding(this.prevHolding)
    RnAlert.error({
      message: intlDebug`Failed to stop the transfer`,
      err,
    })
  }

  @action conferenceTransferring = () => {
    this.prevTransferring = this.transferring
    this.transferring = ''
    this.prevHolding = this.holding
    this.setHolding(false)
    return pbx
      .joinTalkerTransfer(this.pbxTenant, this.pbxTalkerId)
      .catch(this.onConferenceTransferringFailure)
  }
  @action private onConferenceTransferringFailure = (err: Error) => {
    this.transferring = this.prevTransferring
    this.setHolding(this.prevHolding)
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

export type CallConfig = {
  dtmf?: string
  hangup?: string
  hold?: string
  mute?: string
  park?: string
  record?: string
  speaker?: string
  transfer?: string
  video?: string
}
export type CallConfigKey = keyof CallConfig
