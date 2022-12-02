import { action, observable } from 'mobx'
import { Platform } from 'react-native'
import RNCallKeep from 'react-native-callkeep'
import { v4 as newUuid } from 'uuid'

import { Session, SessionStatus } from '../api/brekekejs'
import { pbx } from '../api/pbx'
import { sip } from '../api/sip'
import { getPartyName } from '../stores/contactStore'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { waitTimeout } from '../utils/waitTimeout'
import { getAuthStore } from './authStore'
import { CallStore } from './callStore'
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
  @observable pbxTalkerId = ''
  @observable pbxTenant = ''
  @observable isFrontCamera = true
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
  answer = (options?: any, videoOptions?: any, exInfo?: any) => {
    const ignoreNav = options?.ignoreNav
    if (options) {
      delete options.ignoreNav
    }
    this.answered = true
    this.store.currentCallId = this.id
    // Hold other calls
    this.store.calls
      .filter(c => c.id !== this.id && c.answered && !c.holding)
      .forEach(c => c.toggleHoldWithCheck())
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
    if (Platform.OS === 'web') {
      return
    }
    const updateCallKeep = () => {
      RNCallKeep.setCurrentCallActive(this.callkeepUuid)
      RNCallKeep.setOnHold(this.callkeepUuid, false)
      this.callkeepAlreadyAnswered = true
    }
    const startCallCallKeep = async () => {
      RNCallKeep.startCall(this.callkeepUuid, this.partyNumber, 'Brekeke Phone')
      await waitTimeout()
    }
    const updateIncoming = () => {
      RNCallKeep.answerIncomingCall(this.callkeepUuid)
      updateCallKeep()
    }
    const updateOutgoing = () => {
      RNCallKeep.reportConnectedOutgoingCallWithUUID(this.callkeepUuid)
      updateCallKeep()
    }
    // If it has callkeepUuid, which means: outgoing call / incoming PN call
    if (this.callkeepUuid) {
      if (this.incoming) {
        updateIncoming()
        return
      }
      if (Platform.OS === 'android') {
        // Hack: fix the mix voice issue with gsm call: startCall to add voice connection
        // ios still remains the same (still has bug?)
        await startCallCallKeep()
      }
      updateOutgoing()
      return
    }
    // If it doesnt have callkeepUuid, which means: incoming call without PN
    // We'll treat them all as outgoing call in CallKeep
    // We dont want to display incoming call here again
    if (getAuthStore().getCurrentAccount()?.pushNotificationEnabled) {
      return
    }
    this.callkeepUuid = newUuid().toUpperCase()
    await startCallCallKeep()
    updateOutgoing()
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
    this.localVideoEnabled
      ? sip.disableVideo(this.id)
      : sip.enableVideo(this.id)
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
  private prevHoling = false

  @action private toggleHold = () => {
    const fn = this.holding ? pbx.unholdTalker : pbx.holdTalker
    this.holding = !this.holding
    if (!this.isAboutToHangup) {
      if (this.callkeepUuid && !this.holding) {
        // Hack to fix no voice after unhold: only setOnHold in unhold case
        RNCallKeep.setOnHold(this.callkeepUuid, false)
      }
      BrekekeUtils.setOnHold(this.callkeepUuid, this.holding)
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
    BrekekeUtils.setOnHold(this.callkeepUuid, this.holding)
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
      .then(() => {
        Platform.OS === 'android' &&
          BrekekeUtils.onCloseIncomingActivity(this.callkeepUuid)
      })
      .catch(this.onTransferFailure)
  }
  @action transferAttended = (number: string) => {
    this.transferring = number
    this.prevHoling = this.holding
    this.holding = true
    Nav().backToPageCallManage()
    this.prevHoling = this.holding
    this.holding = true
    return pbx
      .transferTalkerAttended(this.pbxTenant, this.pbxTalkerId, number)
      .then(() => {
        Platform.OS === 'android' &&
          BrekekeUtils.onCloseIncomingActivity(this.callkeepUuid)
      })
      .catch(this.onTransferFailure)
  }
  @action private onTransferFailure = (err: Error) => {
    this.transferring = ''
    this.holding = this.prevHoling
    RnAlert.error({
      message: intlDebug`Failed to transfer the call`,
      err,
    })
  }

  @action stopTransferring = () => {
    this.prevTransferring = this.transferring
    this.transferring = ''
    // User cancel transfer and resume call -> unhold automatically from server side
    this.prevHoling = this.holding
    this.holding = false
    return pbx
      .stopTalkerTransfer(this.pbxTenant, this.pbxTalkerId)
      .then(() => {
        Platform.OS === 'android' &&
          BrekekeUtils.onCloseIncomingActivity(this.callkeepUuid)
      })
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
    this.prevHoling = this.holding
    this.holding = false
    return pbx
      .joinTalkerTransfer(this.pbxTenant, this.pbxTalkerId)
      .then(() => {
        console.error('dev:::joinTalkerTransfer')
        Platform.OS === 'android' &&
          BrekekeUtils.onCloseIncomingActivity(this.callkeepUuid)
      })
      .catch(this.onConferenceTransferringFailure)
  }
  @action private onConferenceTransferringFailure = (err: Error) => {
    this.transferring = this.prevTransferring
    this.holding = this.prevHoling
    RnAlert.error({
      message: intlDebug`Failed to make conference for the transfer`,
      err,
    })
  }

  @action park = (number: string) => {
    return pbx
      .parkTalker(this.pbxTenant, this.pbxTalkerId, number)
      .then(() => {
        Platform.OS === 'android' &&
          BrekekeUtils.onCloseIncomingActivity(this.callkeepUuid)
      })
      .catch(this.onParkFailure)
  }
  private onParkFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to park the call`,
      err,
    })
  }
}
