import type { IReactionDisposer } from 'mobx'
import { action, autorun, observable } from 'mobx'
import RNCallKeep from 'react-native-callkeep'

import type { Session, SessionStatus } from '#/brekekejs'
import { isIos } from '#/config'
import { embedApi } from '#/embed/embedApi'
import { isEmbed } from '#/embed/polyfill'
import type { CallStore } from '#/stores/callStore'
import { getPartyName, getPartyNameAsync } from '#/stores/contactStore'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { BrekekeUtils } from '#/utils/BrekekeUtils'
import { jsonSafe } from '#/utils/jsonSafe'
import { checkPermForCall } from '#/utils/permissions'
import { waitTimeout } from '#/utils/waitTimeout'

export class Call {
  constructor(private store: CallStore) {}
  line?: string
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
  @observable partyName = ''
  @observable pbxTenant = ''
  @observable pbxRoomId = ''
  @observable pbxTalkerId = ''
  @observable pbxUsername = ''
  @observable isFrontCamera = true
  @observable callConfig: CallConfig = {}
  @observable rqLoadings: { [k: string]: boolean } = {
    hold: false,
    record: false,
  }
  @observable ringtoneFromSip = ''

  phoneappliUsername = ''
  phoneappliAvatar = ''
  getDisplayName = () =>
    this.partyName ||
    getPartyName({ partyNumber: this.partyNumber }) ||
    this.partyNumber ||
    this.pbxTalkerId ||
    this.id
  getDisplayNameAsync = async () =>
    this.partyName ||
    (await getPartyNameAsync(this.partyNumber)) ||
    this.partyNumber ||
    this.pbxTalkerId ||
    this.id
  createdAt = Date.now()
  // ios auto answer
  isAutoAnswer = false
  isAudioActive = false
  partyAnswered = false

  @observable incoming = false
  @observable answered = false
  @observable answeredAt = 0

  getDuration = () => this.answeredAt && Date.now() - this.answeredAt

  callkeepUuid = ''
  callkeepAlreadyAnswered = false
  callkeepAlreadyRejected = false

  @action
  answer = async (
    options?: { ignoreNav?: boolean },
    videoOptions?: object,
    exInfo?: string,
  ) => {
    this.holding = false
    this.answered = true
    this.store.setCurrentCallId(this.id)
    this.answerCallKeep()
    const ignoreNav = options?.ignoreNav
    if (options) {
      delete options.ignoreNav
    }
    ctx.sip.phone?.answer(
      this.id,
      options,
      this.remoteVideoEnabled,
      videoOptions,
      'answered',
    )
    // should hangup call if user don't allow permissions for call before answering
    // app will be forced to restart when you change the privacy settings
    // https://stackoverflow.com/a/31707642/25021683
    if (isIos && !(await checkPermForCall(true, false))) {
      this.hangupWithUnhold()
      return
    }
    if (!ignoreNav) {
      ctx.nav.goToPageCallManage()
    }
  }
  answerCallKeep = async () => {
    this.store.setCurrentCallId(this.id)
    // this wait timeout was added intentionally to prevent interacting with callkeep too quick
    // but not sure if it actually improves any?
    await waitTimeout()
    if (!this.callkeepUuid) {
      return
    }
    this.callkeepAlreadyAnswered = true
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
    if (this.holding && !this.rqLoadings['hold']) {
      await this.toggleHold().then(
        success =>
          !success &&
          console.error(
            'hangupWithUnhold: failed to unhold, possible issue with pbx connection',
          ),
      )
      await waitTimeout()
    }
    ctx.sip.hangupSession(this.id)
  }

  // to use in embed api and hang up special transfer case
  hangup = () => {
    this.isAboutToHangup = true
    ctx.sip.hangupSession(this.id)
  }

  @observable videoSessionId = ''
  @observable localVideoEnabled = false
  toggleVideo = () => {
    const pbxUser = ctx.contact.getPbxUserById(this.partyNumber)
    const callerStatus = pbxUser?.talkers?.[0]?.status
    if (this.holding || callerStatus === 'holding') {
      return
    }
    if (this.localVideoEnabled) {
      this.mutedVideo = !this.mutedVideo
      if (this.mutedVideo) {
        ctx.sip.setMutedVideo(true, this.id)
      } else {
        ctx.sip.setMutedVideo(false, this.id)
      }
    } else {
      this.mutedVideo = false
    }
    // for video conference
    // with the current logic of webrtcclient.js
    // if we disable the local stream, it will remove all other streams
    // so to make video conference works, we need to enable to keep receiving other streams
    ctx.sip.enableLocalVideo(this.id)
  }
  @action toggleSwitchCamera = () => {
    if (this.localVideoEnabled && this.mutedVideo) {
      return
    }
    this.isFrontCamera = !this.isFrontCamera
    ctx.sip.switchCamera(this.id, this.isFrontCamera)
  }

  @observable localStreamObject: MediaStream | null = null
  @observable videoClientSessionTable: Array<Session & { vId: string }> = []
  @observable remoteVideoEnabled = false
  @observable videoStreamActive: (Session & { vId: string }) | null = null
  @observable remoteUserOptionsTable: {
    [key: string]: {
      withVideo: boolean
      exInfo: string
      muted: {
        main?: boolean
        videoClient?: boolean
      }
    }
  } = {}
  voiceStreamObject: MediaStream | null = null

  @action updateVideoStreamActive = stream => {
    this.videoStreamActive = stream
  }

  @action updateVideoStreamFromNative = vId => {
    const item = this.videoClientSessionTable.find(v => v.vId === vId)
    item && this.updateVideoStreamActive(item)
  }

  @observable muted = false
  @observable mutedVideo = false
  @action toggleMuted = () => {
    this.muted = !this.muted
    if (this.callkeepUuid) {
      RNCallKeep.setMutedCall(this.callkeepUuid, this.muted)
      BrekekeUtils.setIsMute(this.callkeepUuid, this.muted)
    }
    return ctx.sip.setMuted(this.muted, this.id)
  }

  @observable recording = false
  @action updateRecordingStatus = (status: boolean) => {
    this.recording = status
    BrekekeUtils.setRecordingStatus(this.callkeepUuid, this.recording)
  }
  @action toggleRecording = () => {
    this.rqLoadings['record'] = true
    BrekekeUtils.updateRqStatus(this.callkeepUuid, 'record', true)
    const fn = this.recording
      ? ctx.pbx.stopRecordingTalker
      : ctx.pbx.startRecordingTalker
    this.recording = !this.recording
    return fn(this.pbxTenant, this.pbxTalkerId)
      .then(this.onToggleRecordingFailure)
      .catch(this.onToggleRecordingFailure)
  }
  @action private onToggleRecordingFailure = (err: Error | boolean) => {
    this.rqLoadings['record'] = false
    BrekekeUtils.updateRqStatus(this.callkeepUuid, 'record', false)
    if (err === true) {
      return
    }
    this.recording = !this.recording
  }

  @observable holding = false
  private prevHolding = false
  // TODO: make this more generic to support all pal functions
  pendingRequestIds: string[] = []
  toggleHoldWithCheck = () => {
    if (this.isAboutToHangup) {
      return
    }
    this.toggleHold()
  }

  @action cancelPendingRequest = () => {
    this.pendingRequestIds.forEach(id => {
      ctx.pbx.cancelRequest(id)
    })
    this.pendingRequestIds = []
  }

  private toggleHoldLoading = (isLoading: boolean) => {
    this.rqLoadings['hold'] = isLoading
    BrekekeUtils.updateRqStatus(this.callkeepUuid, 'hold', isLoading)
  }

  @action private toggleHold = async () => {
    this.toggleHoldLoading(true)
    const fn = this.holding ? 'unhold' : 'hold'
    this.setHoldWithCallkeep(fn === 'hold')
    if (!this.isAboutToHangup && fn === 'unhold') {
      this.store.setCurrentCallId(this.id)
    }
    const res = await ctx.pbx[`${fn}Talker`](this.pbxTenant, this.pbxTalkerId)
    const { promise, requestId } = res
    if (requestId) {
      this.pendingRequestIds.push(requestId)
    }
    return promise
      .then(this.onToggleHoldSuccess)
      .catch(this.onToggleHoldFailure)
  }

  private onToggleHoldSuccess = () => {
    this.toggleHoldLoading(false)
    BrekekeUtils.setOnHold(this.callkeepUuid, this.holding)
  }
  @action private onToggleHoldFailure = (err: Error | boolean) => {
    this.toggleHoldLoading(false)
    if (err === true) {
      return true
    }
    if (!err) {
      return false
    }
    const prevFn = this.holding ? 'hold' : 'unhold'
    this.setHoldWithCallkeep(prevFn === 'unhold')
    BrekekeUtils.toast(
      this.callkeepUuid,
      intl`Internet connection failed`,
      '',
      'error',
    )
    return true
  }
  private setHoldWithCallkeep = (holding: boolean) => {
    this.holding = holding
    if (!this.callkeepUuid || this.isAboutToHangup) {
      return
    }
    // TODO:
    // might need to check if there wont be multiple calls holding=false
    RNCallKeep.setOnHold(this.callkeepUuid, holding)
    BrekekeUtils.setOnHold(this.callkeepUuid, holding)
  }
  @action setHoldWithoutCallKeep = async (hold: boolean) => {
    const act = hold ? 'hold' : 'unhold'
    try {
      const res = await ctx.pbx[`${act}Talker`](
        this.pbxTenant,
        this.pbxTalkerId,
      )
      const { promise, requestId } = res
      if (requestId) {
        this.pendingRequestIds.push(requestId)
      }
      const result = await promise
      if (result === true) {
        this.holding = hold
        return true
      }
      return false
    } catch (err) {
      console.error(`setHoldWithoutCallKeep Failed to ${action} call:`, err)
      return false
    }
  }

  @observable transferring = ''
  private prevTransferring = ''
  transferBlind = (number: string) => {
    ctx.nav.goToPageCallRecents()
    return ctx.pbx
      .transferTalkerBlind(this.pbxTenant, this.pbxTalkerId, number)
      .catch(this.onTransferFailure)
  }
  @action transferAttended = (number: string) => {
    this.transferring = number
    // avoid issue no-voice if user set hold before
    this.setHoldWithCallkeep(false)
    ctx.nav.backToPageCallManage()
    return ctx.pbx
      .transferTalkerAttended(this.pbxTenant, this.pbxTalkerId, number)
      .catch(this.onTransferFailure)
  }
  @action private onTransferFailure = (err: Error) => {
    this.transferring = ''
  }

  @action stopTransferring = () => {
    this.prevTransferring = this.transferring
    this.transferring = ''
    // user cancel transfer and resume call -> unhold automatically from server side
    this.setHoldWithCallkeep(false)
    return ctx.pbx
      .stopTalkerTransfer(this.pbxTenant, this.pbxTalkerId)
      .catch(this.onStopTransferringFailure)
  }
  @action private onStopTransferringFailure = (err: Error) => {
    this.transferring = this.prevTransferring
    this.setHoldWithCallkeep(this.prevHolding)
  }

  @action conferenceTransferring = () => {
    this.prevTransferring = this.transferring
    this.transferring = ''
    this.prevHolding = this.holding
    this.setHoldWithCallkeep(false)
    return ctx.pbx
      .joinTalkerTransfer(this.pbxTenant, this.pbxTalkerId)
      .catch(this.onConferenceTransferringFailure)
  }
  @action private onConferenceTransferringFailure = (err: Error) => {
    this.transferring = this.prevTransferring
    this.setHoldWithCallkeep(this.prevHolding)
  }

  @action park = (number: string) =>
    ctx.pbx
      .parkTalker(this.pbxTenant, this.pbxTalkerId, number)
      .catch(this.onParkFailure)
  private onParkFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to park the call`,
      err,
    })
  }

  private _autorunEmitEmbed = false // check if autorun is already started
  private _disposeEmitEmbed?: IReactionDisposer // dispose autorun
  startEmitEmbed = () => {
    if (!isEmbed) {
      return
    }
    embedApi.emit('call', this)
    this._disposeEmitEmbed = autorun(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { store, ...c } = this // do not autorun on store
      jsonSafe(c)
      if (!this._autorunEmitEmbed) {
        this._autorunEmitEmbed = true
        return
      }
      if (this.isAboutToHangup) {
        return
      }
      embedApi.emit('call_update', this)
    })
  }
  disposeEmitEmbed = () => {
    this._disposeEmitEmbed?.()
    this._disposeEmitEmbed = undefined
  }
  finishEmitEmbed = () => {
    if (!isEmbed) {
      return
    }
    this.disposeEmitEmbed()
    embedApi.emit('call_end', this)
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
