import { debounce, isEmpty } from 'lodash'
import { action, computed, observable, runInAction } from 'mobx'
import { AppState } from 'react-native'
import RNCallKeep, { CONSTANTS } from 'react-native-callkeep'
import IncallManager from 'react-native-incall-manager'
import { v4 as newUuid } from 'uuid'

import { mdiPhone } from '#/assets/icons'
import type { MakeCallFn, PbxPhoneappliContact, Session } from '#/brekekejs'
import { defaultTimeout, isAndroid, isIos, isWeb } from '#/config'
import { addCallHistory } from '#/stores/addCallHistory'
import type { ConnectionState } from '#/stores/authStore'
import { Call } from '#/stores/Call'
import type { CancelRecentPn } from '#/stores/cancelRecentPn'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { RnAppState } from '#/stores/RnAppState'
import { RnPicker } from '#/stores/RnPicker'
import { RnStacker } from '#/stores/RnStacker'
import { timerStore } from '#/stores/timerStore'
import { arrToMap } from '#/utils/arrToMap'
import { BackgroundTimer } from '#/utils/BackgroundTimer'
import { BrekekeUtils } from '#/utils/BrekekeUtils'
import type { TEvent } from '#/utils/callkeep'
import { checkMutedRemoteUser } from '#/utils/checkMutedRemoteUser'
import { jsonSafe } from '#/utils/jsonSafe'
import { permForCall } from '#/utils/permissions'
import type { ParsedPn } from '#/utils/PushNotification-parse'
import { waitTimeout } from '#/utils/waitTimeout'
import { webShowNotification } from '#/utils/webShowNotification'

export class CallStore {
  @observable inPageCallManage?: {
    isFromCallBar?: boolean
  } = undefined

  private recentCallActivityAt = 0

  private getCallKeep = (
    uuid: string,
    o?: {
      includingOutgoing?: boolean
      includingAnswered?: boolean
      includingRejected?: boolean
    },
  ) => {
    const pnId = this.getPnIdFromUuid(uuid)
    return this.calls.find(
      c =>
        (!pnId || c.pnId === pnId) &&
        (!c.callkeepUuid || c.callkeepUuid === uuid) &&
        (o?.includingOutgoing || c.incoming) &&
        (o?.includingAnswered || (!c.answered && !c.callkeepAlreadyAnswered)) &&
        (o?.includingRejected || !c.callkeepAlreadyRejected) &&
        !c.isAboutToHangup,
    )
  }

  // to check and reconnect pbx
  bgAt = 0
  fgAt = 0

  @action onCallKeepDidDisplayIncomingCall = async (
    uuid: string,
    n?: ParsedPn,
  ) => {
    ctx.pbx.ping()
    this.setAutoEndCallKeepTimer(uuid, n)
    if (!uuid || !n) {
      return
    }
    const c = this.getCallKeep(uuid)
    if (n.sipPn.autoAnswer && c) {
      if (RnAppState.foregroundOnce && AppState.currentState !== 'active') {
        RNCallKeep.backToForeground()
      }
      // on android already answer in native java activity
      // on ios, QA suggest to reject the call?
      // TODO:
      if (isIos) {
        c.isAutoAnswer = true
        BackgroundTimer.setTimeout(() => {
          RNCallKeep.answerIncomingCall(uuid)
        }, 2000)
      }
    }
    ctx.sip.checkAndRemovePnTokenViaSip(n)
    // find the current incoming call which is not callkeep
    // assign the data and config
    if (c) {
      c.callkeepUuid = uuid
      BrekekeUtils.setCallConfig(uuid, jsonSafe(c.callConfig))
    }
    // check if call is rejected already
    const rejected = this.isCallRejected({
      callkeepUuid: uuid,
      pnId: n.id,
    })
    // check if call is expired already
    let expired = false
    const d = await ctx.account.findDataByPn(n)
    const pnExpires = Number(d?.pnExpires) || 50000 // default to 50s
    const now = Date.now()
    if (n.time) {
      expired = now > n.time + pnExpires
    }
    console.log(
      `SIP PN debug: onCallKeepDidDisplayIncomingCall uuid=${uuid} pnId=${n.id} sessionId=${c?.id} rejected=${rejected} now=${now} n.time=${n.time} pnExpires=${pnExpires} expired=${expired}`,
    )
    if (rejected || expired) {
      this.endCallKeep(uuid)
      return
    }
    // auto reconnect if no activity
    // this logic is about the case connection has dropped silently
    // so even if sipState is `success` but the connection has dropped
    // we just drop the connection no matter if it is alive or not
    // then construct a new connection to receive the call as quickly as possible
    const count = ctx.sip.phone?.getSessionCount()
    if (count) {
      return
    }
    if (
      ctx.auth.sipState !== 'connecting' &&
      now - this.recentCallActivityAt > 3000
    ) {
      console.log('SIP PN debug: reconnect sip on new notification')
      ctx.auth.sipState = 'stopped'
      ctx.sip.destroyWebRTC()
      ctx.authSIP.auth()
    }
    if (ctx.auth.pbxState !== 'connecting') {
      const fg = AppState.currentState === 'active'
      const fgDiff = now - this.fgAt
      const bgDiff = now - this.bgAt
      console.log(
        `PBX PN debug: try reconnect pbx on new notification fg=${fg} diff=${fg ? fgDiff : bgDiff}`,
      )
      // if it has just waken up less than 1s, or been bg more than 10s, then reconnect pbx
      if ((fg && fgDiff < 1000) || (!fg && bgDiff > 10000)) {
        ctx.auth.pbxState = 'stopped'
        ctx.authPBX.dispose()
        ctx.authPBX.auth()
      }
    }
  }
  @action onCallKeepAnswerCall = (uuid: string) => {
    this.setCallKeepAction({ callkeepUuid: uuid }, 'answerCall')
    const c = this.getCallKeep(uuid)
    console.log(`SIP PN debug: onCallKeepAnswerCall found: ${!!c}`)
    if (c && !c.callkeepAlreadyAnswered) {
      c.callkeepAlreadyAnswered = true
      c.answer()
    }
  }
  @action onCallKeepEndCall = (uuid: string) => {
    this.setCallKeepAction({ callkeepUuid: uuid }, 'rejectCall')
    const c = this.getCallKeep(uuid, {
      includingAnswered: true,
      includingRejected: isAndroid,
      includingOutgoing: isIos,
    })
    console.log(`SIP PN debug: onCallKeepEndCall found: ${!!c}`)
    if (c) {
      c.callkeepAlreadyRejected = true
      c.hangupWithUnhold()
    }
    this.endCallKeep(uuid)
  }

  @observable calls: Call[] = []

  setCurrentCallId = (id: string) => {
    this.displayingCallId = id
    this.ongoingCallId = id
    this.updateBackgroundCalls()
  }
  @observable ongoingCallId: string = ''
  @observable displayingCallId = ''
  prevDisplayingCallId = ''

  getOngoingCall = () => {
    this.updateCurrentCallDebounce()
    const oc = this.calls.find(c => c.id === this.ongoingCallId)
    // TODO:
    // should not modify state in getter
    // this will throw an error in mobx-react
    // currently we forked mobx-react to temporary get over this error
    // in the future we need to rewrite and refactor the whole stores/actions
    if (oc) {
      const ca = ctx.auth.getCurrentAccount()
      if (!oc.answered && (!oc.partyImageUrl || !oc.partyImageUrl?.length)) {
        oc.partyImageUrl = ca?.ucEnabled
          ? this.getOriginalUserImageUrl(oc.pbxTenant, oc.partyNumber)
          : ''
        oc.partyImageSize = ca?.ucEnabled ? 'large' : ''
      }
      if (oc.answered && (!oc.talkingImageUrl || !oc.talkingImageUrl.length)) {
        oc.talkingImageUrl = ca?.ucEnabled
          ? this.getOriginalUserImageUrl(oc.pbxTenant, oc.partyNumber)
          : ''
      }
    }
    return oc
  }

  @action updateCallAvatar = (n: ParsedPn) => {
    let c: Call | undefined = undefined
    if (n.callkeepUuid) {
      c = this.calls.find(_ => _.callkeepUuid === n.callkeepUuid)
    }
    if (!c && n.id) {
      c = this.calls.find(_ => _.pnId === n.id)
    }
    if (!c) {
      c = this.getOngoingCall()
    }
    if (!c) {
      return
    }
    c.partyImageUrl = n.image
    c.partyImageSize = n.image_size || 'small'
  }

  private getOriginalUserImageUrl = (tenant: string, name: string): string => {
    if (!tenant || !name) {
      return ''
    }
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return ''
    }
    const { pbxHostname, pbxPort } = ca
    let ucHost = `${pbxHostname}:${pbxPort}`
    if (ucHost.indexOf(':') < 0) {
      ucHost += ':443'
    }
    const ucScheme = ucHost.endsWith(':80') ? 'http' : 'https'
    const baseUrl = `${ucScheme}://${ucHost}`
    return `${baseUrl}/uc/image?ACTION=DOWNLOAD&tenant=${tenant}&user=${name}&SIZE=ORIGINAL`
  }

  private incallManagerStarted = false
  onCallUpsert: CallStore['upsertCall'] = async c => {
    this.upsertCall(c)
    if (
      isAndroid &&
      !this.incallManagerStarted &&
      this.calls.find(_ => _.answered || !_.incoming)
    ) {
      this.incallManagerStarted = true
      IncallManager.start()
    }
  }

  updatePhoneAppliAvatar = (c: Call, res: PbxPhoneappliContact | undefined) => {
    if (!c || !res) {
      return
    }

    const partyImageUrl = res?.image_url || c.partyImageUrl
    const talkingImageUrl = res?.image_url || c.talkingImageUrl
    const partyName = res?.display_name || c.partyName
    const partyImageSize = res?.image_url ? 'large' : c.partyImageSize

    // this method is called after an async operator and the call might be ended
    const stillExist = this.calls.some(
      _ => _.callkeepUuid === c.callkeepUuid || _.id === c.id,
    )
    if (!stillExist) {
      return
    }

    Object.assign(c, {
      partyImageUrl,
      talkingImageUrl,
      partyName,
      partyImageSize,
      phoneappliAvatar: res?.image_url,
      phoneappliUsername: res?.display_name,
    })
    BrekekeUtils.setTalkingAvatar(
      c.callkeepUuid,
      c.talkingImageUrl,
      c.partyImageSize === 'large',
    )
  }
  @action private upsertCall = async (
    // partial
    p: Pick<Call, 'id'> &
      Partial<Omit<Call, 'id'>> & {
        remoteVideoStreamObject?: MediaStream | null
        remoteWithVideo?: boolean
      },
  ) => {
    this.updateCurrentCallDebounce()
    const now = Date.now()
    this.recentCallActivityAt = now
    //
    // existing
    const e = this.calls.find(c => c.id === p.id)
    if (e) {
      if (p.callConfig) {
        // merge new config with current config instead of replacing
        Object.assign(e.callConfig, p.callConfig)
      }
      delete p.callConfig
      if (e.callkeepUuid) {
        BrekekeUtils.setCallConfig(e.callkeepUuid, jsonSafe(e.callConfig))
      }
      if (p.rawSession && e.rawSession) {
        Object.assign(e.rawSession, p.rawSession)
        delete p.rawSession
      }

      if (e.incoming && e.callkeepUuid) {
        if (
          p.localStreamObject &&
          p.localStreamObject !== e.localStreamObject
        ) {
          BrekekeUtils.setLocalStream(
            e.callkeepUuid,
            p.localStreamObject.toURL(),
          )
        }
        if (p.videoSessionId) {
          if (p.remoteVideoStreamObject) {
            BrekekeUtils.addStreamToView(e.callkeepUuid, {
              vId: p.videoSessionId,
              streamUrl: p.remoteVideoStreamObject.toURL(),
            })
          } else {
            BrekekeUtils.removeStreamFromView(e.callkeepUuid, p.videoSessionId)
          }
        }
      }

      if (!e.answered && p.answered) {
        e.answerCallKeep()
        p.answeredAt = now
        BrekekeUtils.onCallConnected(e.callkeepUuid)
        this.prevDisplayingCallId = e.id
        BrekekeUtils.setSpeakerStatus(this.isLoudSpeakerEnabled)

        // auto mute video if the call is answered and local video is not enabled or incoming call
        if (!e.localVideoEnabled || (e.localVideoEnabled && e.incoming)) {
          e.mutedVideo = true
          ctx.sip.setMutedVideo(true, e.id)
        }
      }
      // handle logic set hold when user don't answer the call on PN incoming with auto answer function on iOS #975
      if (p.remoteUserOptionsTable?.[e.partyNumber]?.exInfo === 'answered') {
        e.partyAnswered = true
      }
      if (
        isIos &&
        e.isAutoAnswer &&
        !e.isAudioActive &&
        e.partyAnswered &&
        AppState.currentState !== 'active'
      ) {
        e.setHoldWithoutCallKeep(true)
      }

      // auto enable local video if the call is answered and remote video is enabled
      // but local video is not enabled
      if (
        e.answered &&
        !e.remoteVideoEnabled &&
        p.remoteVideoEnabled &&
        !e.localVideoEnabled
      ) {
        ctx.sip.enableLocalVideo(e.id)
      }

      Object.assign(e, p, {
        withSDPControls: e.withSDPControls || p.withSDP,
      })

      // handle always show Avatar and Username when phoneappli enabled with outgoing call
      if (ctx.auth.phoneappliEnabled() && !e.incoming) {
        Object.assign(e, {
          partyImageUrl: e.phoneappliAvatar || p.partyImageUrl,
          talkingImageUrl: e.phoneappliAvatar || p.talkingImageUrl,
          partyName: e.phoneappliUsername || p.partyName,
          partyImageSize: e.phoneappliAvatar ? 'large' : p.partyImageSize,
        })
      }

      if (e.talkingImageUrl && e.talkingImageUrl.length > 0) {
        BrekekeUtils.setTalkingAvatar(
          e.callkeepUuid,
          e.talkingImageUrl,
          e.partyImageSize === 'large',
        )
      }

      if (
        e.incoming &&
        e.callkeepUuid &&
        typeof e.localVideoEnabled === 'boolean'
      ) {
        BrekekeUtils.setIsVideoCall(
          e.callkeepUuid,
          e.localVideoEnabled,
          e.mutedVideo,
        )
      }

      if (e.incoming && e.callkeepUuid) {
        const options = Object.entries(e.remoteUserOptionsTable).map(
          ([key, v]) => {
            const itemExisted = e.videoClientSessionTable.find(
              item => item.user === key,
            )
            if (itemExisted) {
              return {
                vId: itemExisted.vId,
                enableVideo: checkMutedRemoteUser(v.muted),
              }
            }
            return {
              vId: '',
              enableVideo: false,
            }
          },
        )
        BrekekeUtils.setOptionsRemoteStream(e.callkeepUuid, options)
      }

      return
    }

    // bug call update event come after terminated, due to this async function
    if (this.callTerminated[p.id]) {
      return
    }

    //
    // construct a new call
    const c = new Call(this)
    Object.assign(c, p)
    // clear start call interval timer when the outgoing call is created
    if (isWeb && !c.incoming) {
      this.clearStartCallIntervalTimer()
    }
    // get Avatar and Username of phoneappli
    const ca = ctx.auth.getCurrentAccount()
    if (ctx.auth.phoneappliEnabled() && !c.incoming && ca) {
      const { pbxTenant, pbxUsername } = ca
      ctx.pbx
        .getPhoneappliContact(pbxTenant, pbxUsername, c.partyNumber)
        .then(res => {
          this.updatePhoneAppliAvatar(c, res)
        })
    }

    this.calls = [c, ...this.calls]
    this.displayingCallId = c.id // do not set ongoing call
    // update java and embed api
    BrekekeUtils.setJsCallsSize(this.calls.length)
    // emit to embed api
    c.startEmitEmbed()
    // desktop notification
    if (isWeb && c.incoming && !c.answered) {
      const name = await c.getDisplayNameAsync()
      webShowNotification(name + ' ' + intl`Incoming call`, name)
    }
    if (!c.incoming && !c.callkeepUuid && this.callkeepUuidPending) {
      c.callkeepUuid = this.callkeepUuidPending
      this.callkeepUuidPending = ''
    }
    if (
      !isWeb &&
      c.incoming &&
      !c.callkeepUuid &&
      !ca?.pushNotificationEnabled
    ) {
      const uuid = newUuid().toUpperCase()
      c.callkeepUuid = uuid
      RNCallKeep.displayIncomingCall(
        uuid,
        c.partyNumber,
        await c.getDisplayNameAsync(),
        'generic',
      )
    }
    // get and check callkeep if pending incoming call
    if (isWeb || !c.incoming || c.answered) {
      return
    }
    c.callkeepUuid = c.callkeepUuid || this.getUuidFromPnId(c.pnId) || ''

    if (
      c.callkeepUuid &&
      !this.calls.some(i => i.callkeepUuid !== c.callkeepUuid)
    ) {
      c.isAutoAnswer =
        c.isAutoAnswer || this.getAutoAnswerFromPnId(c.pnId) || false
    }

    const callkeepAction = this.getCallKeepAction(c)
    console.log(
      `PN ID debug: upsertCall pnId=${c.pnId} callkeepUuid=${c.callkeepUuid} callkeepAction=${callkeepAction}`,
    )
    if (callkeepAction === 'answerCall') {
      c.callkeepAlreadyAnswered = true
      c.answer()
      console.log('SIP PN debug: answer by recentPnAction')
    } else if (callkeepAction === 'rejectCall') {
      c.callkeepAlreadyRejected = true
      c.hangupWithUnhold()
      console.log('SIP PN debug: reject by recentPnAction')
    }
  }

  callTerminated: { [sessionId: string]: true } = {}
  @action onCallRemove = async (rawSession: Session) => {
    this.callTerminated[rawSession.sessionId] = true

    this.updateCurrentCallDebounce()
    this.recentCallActivityAt = Date.now()
    const c = this.calls.find(_ => _.id === rawSession.sessionId)
    if (!c) {
      return
    }

    c.cancelPendingRequest()

    if (c.rawSession) {
      Object.assign(c.rawSession, rawSession)
    } else {
      c.rawSession = rawSession
    }
    this.onSipUaCancel({ pnId: c.pnId })
    if (c.callkeepUuid) {
      this.endCallKeep(c.callkeepUuid)
    }

    this.calls = this.calls.filter(c0 => c0.id !== c.id)
    // set number of total calls in our custom java incoming call module
    BrekekeUtils.setJsCallsSize(this.calls.length)
    // when if this is a outgoing call, try to insert a call history to uc chat
    if (ctx.auth.ucState === 'success' && c.answeredAt && !c.incoming) {
      ctx.uc.sendCallResult(c.getDuration(), c.partyNumber)
    }
    // reset loud speaker if there's no call left
    if (!isWeb && !this.calls.length) {
      this.isLoudSpeakerEnabled = false
      if (isIos) {
        IncallManager.setForceSpeakerphoneOn(false)
      }
    }
    // stop android incall manager if there's no call left
    if (isAndroid && this.incallManagerStarted && !this.calls.length) {
      this.incallManagerStarted = false
      IncallManager.stop()
      // reset audio mode to allow notification to play sound
      BrekekeUtils.setAudioMode(0)
    }

    await addCallHistory(c)
    c.callkeepUuid = ''
    c.callkeepAlreadyRejected = true

    // emit to embed api
    c.finishEmitEmbed()
  }

  @computed get isAnyHoldLoading() {
    return this.calls.some(call => call.rqLoadings['hold'])
  }
  @action onSelectBackgroundCall = async (c: Immutable<Call>) => {
    this.setCurrentCallId(c.id)
    ctx.nav.backToPageCallManage()
    await waitTimeout()
    if (c.holding && c.rqLoadings['hold']) {
      c.toggleHoldWithCheck()
    }
  }

  private startCallIntervalAt = 0
  private startCallIntervalId = 0
  private clearStartCallIntervalTimer = () => {
    if (this.startCallIntervalId) {
      BackgroundTimer.clearInterval(this.startCallIntervalId)
      this.startCallIntervalId = 0
    }
  }
  private callkeepUuidPending = ''
  startCall: MakeCallFn = async (number: string, ...args) => {
    // make sure sip is ready before make call
    if (ctx.auth.sipState !== 'success') {
      return false
    }
    if (!(await permForCall())) {
      return false
    }
    if (
      this.callkeepUuidPending ||
      this.calls.filter(c => !c.incoming && !c.answered).length
    ) {
      RnAlert.error({
        message: intlDebug`There is already an outgoing call`,
      })
      return false
    }
    // check line resource
    if (
      ctx.auth.resourceLines.length > 0 &&
      !this.isLineExist(args[0], ctx.auth.resourceLines)
    ) {
      try {
        const extraHeaders = await this.getExtraHeader(
          ctx.auth.resourceLines,
          args[0],
        )
        args[0] = { ...args[0], extraHeaders }
      } catch (err) {
        return false
      }
    }
    // start call logic in RNCallKeep
    // adding this will help the outgoing call automatically hold on GSM call
    let uuid = ''
    if (!isWeb) {
      uuid = newUuid().toUpperCase()
      this.callkeepUuidPending = uuid
      if (isAndroid) {
        RNCallKeep.startCall(uuid, ctx.global.productName, number)
      } else {
        RNCallKeep.startCall(uuid, number, number, 'generic', false)
        // enable proximity monitoring for trigger proximity state to keep the call alive
        BrekekeUtils.setProximityMonitoring(true)
        // ios if sip call get response INVITE 18x quickly in 50ms - 130ms
        // add time out to make sure audio active (didDeactivateAudioSession)
        // before sip call established
        await waitTimeout(1000)
      }
      this.setAutoEndCallKeepTimer(uuid)
    }
    const sipCreateSession = () => {
      // do not make call if the callkeep ended
      if (uuid && uuid !== this.callkeepUuidPending) {
        return
      }
      ctx.sip.phone?.makeCall(number, ...args)
    }
    // reset sip connection state and navigate to the call manage screen
    ctx.auth.sipTotalFailure = 0
    ctx.nav.goToPageCallManage({ isOutgoingCall: true })
    // it can be reconnected, use type conversion here to fix ts error
    const sipState = ctx.auth.sipState as ConnectionState
    if (
      sipState === 'waiting' ||
      sipState === 'failure' ||
      sipState === 'stopped'
    ) {
      ctx.auth.reconnectAndWaitSip().then(sipCreateSession)
      return true
    }
    if (sipState === 'connecting') {
      ctx.auth.waitSip().then(sipCreateSession)
      return true
    }
    // in case of sip state is success
    // there could still cases that the sip is disconnected but state not updated yet
    // like putting the phone on background or changing the network
    let reconnectCalled = false
    try {
      sipCreateSession()
    } catch (err) {
      reconnectCalled = true
      ctx.auth.reconnectAndWaitSip().then(sipCreateSession)
    }
    // reset the currentCallId to display the new call
    // check for each 0.5s internval auto update currentCallId
    // the call will be emitted from sip, we need to use interval here to set it
    // also if after 3s there's no call in store, reconnect
    runInAction(() => {
      this.setCurrentCallId('')
    })
    const prevIds = arrToMap(this.calls, 'id')
    this.clearStartCallIntervalTimer()
    this.startCallIntervalAt = Date.now()
    this.startCallIntervalId = BackgroundTimer.setInterval(
      action(() => {
        const curr = this.calls.find(c => !c.incoming && !prevIds[c.id])
        if (curr) {
          if (uuid) {
            curr.callkeepUuid = uuid
          }
          this.setCurrentCallId(curr.id)
          this.clearStartCallIntervalTimer()
          return
        }
        const diff = Date.now() - this.startCallIntervalAt
        // add a guard of 10s to clear the interval
        if (diff > 10000) {
          if (uuid) {
            this.callkeepUuidPending = ''
            this.endCallKeep(uuid)
          }
          this.clearStartCallIntervalTimer()
          return
        }
        // also if after 3s there's no call in store, reconnect
        // it's likely a connection issue occurred
        if (!reconnectCalled && diff > 3000) {
          reconnectCalled = true
          ctx.auth.reconnectAndWaitSip().then(sipCreateSession)
          this.clearStartCallIntervalTimer()
        }
      }),
      500,
    )
    return true
  }
  startVideoCall = (number: string) => this.startCall(number, undefined, true)

  updateBackgroundCalls = () => {
    // auto hold background calls
    if (!this.ongoingCallId) {
      return
    }
    this.calls
      .filter(
        c =>
          c.id !== this.ongoingCallId &&
          c.answered &&
          !c.transferring &&
          !c.holding &&
          !c.isAboutToHangup,
      )
      .forEach(c => c.toggleHoldWithCheck())
  }
  private updateBackgroundCallsDebounce = debounce(
    this.updateBackgroundCalls,
    defaultTimeout,
    { maxWait: 1000 },
  )
  @action private updateCurrentCall = () => {
    const oc =
      this.calls.find(c => c.id === this.ongoingCallId) ||
      this.calls.find(c => c.answered && !c.holding && !c.isAboutToHangup) ||
      this.calls.find(c => c)
    this.setCurrentCallId(oc?.id || '')
    if (!this.ongoingCallId) {
      const [s0, ...stacks] = RnStacker.stacks
      if (stacks.some(s => s.name.startsWith('PageCall'))) {
        RnStacker.stacks = [s0]
      }
    }
    this.updateBackgroundCallsDebounce()
  }
  private updateCurrentCallDebounce = debounce(
    this.updateCurrentCall,
    defaultTimeout,
    {
      maxWait: 1000,
    },
  )

  // callkeep + pn data
  @observable callkeepMap: {
    [uuid: string]: {
      uuid: string
      at: number
      incomingPnData?: ParsedPn
      hasAction?: boolean
    }
  } = {}
  private getUuidFromPnId = (pnId: string) =>
    Object.values(this.callkeepMap)
      .map(c => c.incomingPnData)
      .find(d => d?.id === pnId)?.callkeepUuid
  private getPnIdFromUuid = (uuid: string) =>
    this.callkeepMap[uuid]?.incomingPnData?.id
  private getSetUuidPnId = (c: TCallKeepIds) => {
    if (c.callkeepUuid && !c.pnId) {
      c.pnId = this.getPnIdFromUuid(c.callkeepUuid)
    }
    if (c.pnId && !c.callkeepUuid) {
      c.callkeepUuid = this.getUuidFromPnId(c.pnId)
    }
  }
  private getAutoAnswerFromPnId = (pnId: string) =>
    Object.values(this.callkeepMap)
      .map(c => c.incomingPnData)
      .find(d => d?.id === pnId)?.sipPn?.autoAnswer

  // logic to end call if timeout of 20s
  private autoEndCallKeepTimerId = 0
  private clearAutoEndCallKeepTimer = () => {
    if (isWeb || !this.autoEndCallKeepTimerId) {
      return
    }
    BackgroundTimer.clearInterval(this.autoEndCallKeepTimerId)
    this.autoEndCallKeepTimerId = 0
  }
  @action private setAutoEndCallKeepTimer = (
    uuid: string,
    incomingPnData?: ParsedPn,
  ) => {
    if (isWeb) {
      return
    }
    if (incomingPnData) {
      incomingPnData.callkeepUuid = uuid
    }
    this.callkeepMap[uuid] = {
      uuid,
      at: Date.now(),
      incomingPnData,
    }
    this.clearAutoEndCallKeepTimer()
    this.autoEndCallKeepTimerId = BackgroundTimer.setInterval(() => {
      const n = Date.now()
      Object.values(this.callkeepMap).forEach(k => {
        if (n - k.at > 20000) {
          const c = this.calls.find(_ => _.callkeepUuid === k.uuid)
          if (!c) {
            this.endCallKeep(k.uuid)
          }
        }
      })
      if (!Object.keys(this.callkeepMap).length) {
        this.clearAutoEndCallKeepTimer()
      }
    }, 500)
  }
  @action private endCallKeep = (
    uuid: string,
    {
      setAction = true,
      completedElseWhere,
      completedBy,
    }: {
      setAction?: boolean
      completedElseWhere?: boolean
      completedBy?: string
    } = {},
  ) => {
    if (!uuid) {
      return
    }
    if (uuid === this.callkeepUuidPending) {
      this.callkeepUuidPending = ''
    }
    console.log('PN callkeep debug: endCallKeep ' + uuid)
    if (setAction) {
      this.setCallKeepAction({ callkeepUuid: uuid }, 'rejectCall')
    }
    // disable proximity mode if no running call
    if (isIos && !this.calls.length) {
      BrekekeUtils.setProximityMonitoring(false)
    }
    const pnData = this.callkeepMap[uuid]?.incomingPnData
    if (
      pnData &&
      !this.calls.some(c => c.callkeepUuid === uuid || c.pnId === pnData.id) &&
      !completedElseWhere
    ) {
      addCallHistory(pnData, completedBy)
    }
    delete this.callkeepMap[uuid]
    RNCallKeep.rejectCall(uuid)
    RNCallKeep.endCall(uuid)
    RNCallKeep.reportEndCallWithUUID(
      uuid,
      CONSTANTS.END_CALL_REASONS.REMOTE_ENDED,
    )
    BrekekeUtils.closeIncomingCall(uuid)
  }
  endCallKeepAllCalls = () => {
    if (!isWeb) {
      RNCallKeep.endAllCalls()
    }
    BrekekeUtils.closeAllIncomingCalls()
    this.onCallKeepAction()
  }
  @action onCallKeepAction = () => {
    this.calls
      .map(c => this.callkeepMap[c.callkeepUuid])
      .filter(c => c)
      .forEach(c => {
        c.hasAction = true
      })
  }

  // move from callkeep.ts to avoid circular dependencies
  // logic to show incoming call ui in case of already have a running call in RNCallKeep android
  private alreadyShowIncomingCallUi: { [k: string]: boolean } = {}
  showIncomingCallUi = (e: TEvent & { pnData: ParsedPn }) => {
    const uuid = e.callUUID.toUpperCase()
    if (this.alreadyShowIncomingCallUi[uuid]) {
      console.log('SIP PN debug: showIncomingCallUi: already show this uuid')
      return
    }
    this.alreadyShowIncomingCallUi[uuid] = true
    if (this.isCallRejected({ callkeepUuid: uuid, pnId: e.pnData.id })) {
      console.log(
        'SIP PN debug: showIncomingCallUi: call already rejected on js side',
      )
      this.endCallKeep(uuid)
      return
    }
    this.onCallKeepDidDisplayIncomingCall(uuid, e.pnData)
  }

  // actions map in case of call is not available at the time receive the action
  // this map wont be deleted if the callkeep end
  @observable callkeepActionMap: {
    [uuidOrPnId: string]: TCallKeepAction
  } = {}
  private setCallKeepAction = (c: TCallKeepIds, a: TCallKeepAction) => {
    this.getSetUuidPnId(c)
    if (c.callkeepUuid) {
      this.callkeepActionMap[c.callkeepUuid] = a
    }
    if (c.pnId) {
      this.callkeepActionMap[c.pnId] = a
    }
    this.onCallKeepAction()
  }

  private getCallKeepAction = (c: TCallKeepIds) =>
    (c.callkeepUuid && this.callkeepActionMap[c.callkeepUuid]) ||
    (c.pnId && this.callkeepActionMap[c.pnId])
  isCallRejected = (c?: TCallKeepIds) =>
    c && this.getCallKeepAction(c) === 'rejectCall'

  calleeRejectedMap: {
    [uuidOrPnId: string]: boolean
  } = {}
  setCalleeRejected = (c: TCallKeepIds) => {
    this.getSetUuidPnId(c)
    if (c.callkeepUuid) {
      this.calleeRejectedMap[c.callkeepUuid] = true
    }
    if (c.pnId) {
      this.calleeRejectedMap[c.pnId] = true
    }
  }

  getCallInNotify = () =>
    // do not display our callbar if already show callkeep
    this.calls.find(_ => {
      const k = this.callkeepMap[_.callkeepUuid]
      return (
        _.incoming &&
        !_.answered &&
        (!k ||
          k.hasAction ||
          // trigger timerStore.now observer at last
          timerStore.now - _.createdAt > 1000)
      )
    })

  shouldRingInNotify = () => {
    if (isWeb) {
      return true
    }
    const ca = ctx.auth.getCurrentAccount()
    // do not ring if PN is turned on
    if (ca?.pushNotificationEnabled) {
      return false
    }
    // do not ring in ios even if PN is turned off
    // since we already show the call via RNCallKeep in js code
    if (isIos) {
      return false
    }
    // do not ring on background
    if (RnAppState.currentState !== 'active') {
      return false
    }
    // do not ring if has an ongoing answered call
    if (this.calls.some(_ => _.answered)) {
      return false
    }
    return true
  }

  // to be used in sip.phone._ua.on('newNotify')
  onSipUaCancel = (n?: CancelRecentPn) => {
    if (!n?.pnId) {
      return
    }
    const uuid = this.getUuidFromPnId(n.pnId)
    console.log(`SIP PN debug: cancel PN uuid=${uuid}`)
    this.setCallKeepAction({ pnId: n.pnId }, 'rejectCall')
    if (uuid) {
      this.endCallKeep(uuid, {
        completedElseWhere: n.completedElseWhere,
        completedBy: n.completedBy,
      })
    }
  }

  getExtraHeader = async (resourceLines, exh) => {
    const extraHeaders = exh?.extraHeaders || []
    const index = extraHeaders.findIndex(header =>
      header.startsWith('X-PBX-RPI:'),
    )
    const allowNoLine = resourceLines.some(l => l.value === '')
    // if it allows calling without a value `no-line`, then make a call without a line resource.
    if (allowNoLine && index !== -1) {
      extraHeaders.splice(index, 1)
      return extraHeaders
    }
    // show select line picker
    const selectedKey = await new Promise((resolve, reject) => {
      RnPicker.open({
        options: resourceLines.map(l => ({
          key: l.value,
          label: l.key,
          icon: mdiPhone,
        })),
        onSelect: (k: string) => {
          resolve(k)
        },
        onDismiss: () => {
          reject(null)
        },
      })
    })
    // for case choose "no-line"
    if (!selectedKey) {
      if (index !== -1) {
        extraHeaders.splice(index, 1)
      }
      return extraHeaders
    }
    if (index !== -1) {
      extraHeaders[index] = `X-PBX-RPI: ${selectedKey}`
    } else {
      extraHeaders.push(`X-PBX-RPI: ${selectedKey}`)
    }
    return extraHeaders
  }
  isLineExist = (options, resourceLines) => {
    if (!options || !options.extraHeaders || isEmpty(options.extraHeaders)) {
      return false
    }
    return options.extraHeaders.some(h => {
      const m = h.match(/^X-PBX-RPI:(.*)$/)
      if (m) {
        const v = m[1].trim()
        return resourceLines.some(l => l.value === v)
      }
      return false
    })
  }

  constructor() {
    if (!isAndroid) {
      return
    }
    BrekekeUtils.setIsAppActive(AppState.currentState === 'active', false)
    // if it is locked right after blur 300ms
    //    we assume it was put in background because of lock
    // no need to remove listener since this is singleton without cleanup for now
    AppState.addEventListener('change', currentState => {
      BrekekeUtils.setIsAppActive(currentState === 'active', false)
      if (currentState === 'active') {
        return
      }
      BackgroundTimer.setTimeout(async () => {
        if (await BrekekeUtils.isLocked()) {
          BrekekeUtils.setIsAppActive(false, true)
        }
      }, defaultTimeout)
    })
  }

  @observable parkNumbers: { [k: string]: boolean } = {}
  @action addParkNumber = (parkNumber: string) => {
    this.parkNumbers[parkNumber] = true
  }
  @action removeParkNumber = (parkNumber: string) => {
    delete this.parkNumbers[parkNumber]
  }

  // some other fields
  @observable isLoudSpeakerEnabled = false
  @action toggleLoudSpeaker = () => {
    if (isWeb) {
      return
    }
    this.isLoudSpeakerEnabled = !this.isLoudSpeakerEnabled
    if (isIos) {
      IncallManager.setForceSpeakerphoneOn(this.isLoudSpeakerEnabled)
      return
    }
    const uuid = this.getOngoingCall()?.callkeepUuid
    if (!uuid) {
      return
    }
    RNCallKeep.toggleAudioRouteSpeaker(uuid, this.isLoudSpeakerEnabled)
    BrekekeUtils.setSpeakerStatus(this.isLoudSpeakerEnabled)
  }
  @observable newVoicemailCount = 0
  @action setNewVoicemailCount = (n: number) => {
    this.newVoicemailCount = n
  }
  // style in CallVideosUI to save the previous video position
  @observable videoPositionT = 25
  @observable videoPositionL = 5
  // for embed api
  // to set ringtone in CallVoicesUI.web.tsx
  @observable ringtone = ''
  @action setIncomingRingtone = (ringtone: string) => {
    this.ringtone = ringtone
  }
}

ctx.call = new CallStore()

export type TCallKeepAction = 'answerCall' | 'rejectCall'
type TCallKeepIds = Partial<Pick<Call, 'callkeepUuid' | 'pnId'>>
