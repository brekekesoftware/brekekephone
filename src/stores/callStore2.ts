import { debounce } from 'lodash'
import { action, observable, runInAction } from 'mobx'
import { AppState, Platform } from 'react-native'
import RNCallKeep, { CONSTANTS } from 'react-native-callkeep'
import IncallManager from 'react-native-incall-manager'
import { v4 as newUuid } from 'uuid'

import { checkAndRemovePnTokenViaSip, sip } from '../api/sip'
import { uc } from '../api/uc'
import { MakeCallFn, Session } from '../brekekejs'
import { embedApi } from '../embed/embedApi'
import { arrToMap } from '../utils/arrToMap'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { TEvent } from '../utils/callkeep'
import { permForCall } from '../utils/permissions'
import { ParsedPn } from '../utils/PushNotification-parse'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { waitTimeout } from '../utils/waitTimeout'
import { webShowNotification } from '../utils/webShowNotification'
import { accountStore } from './accountStore'
import { addCallHistory } from './addCallHistory'
import { authSIP } from './AuthSIP'
import { getAuthStore, reconnectAndWaitSip, waitSip } from './authStore'
import { Call } from './Call'
import { setCallStore } from './callStore'
import { CancelRecentPn } from './cancelRecentPn'
import { intl, intlDebug } from './intl'
import { Nav } from './Nav'
import { RnAlert } from './RnAlert'
import { RnAppState } from './RnAppState'
import { RnStacker } from './RnStacker'
import { timerStore } from './timerStore'

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

  @action onCallKeepDidDisplayIncomingCall = async (
    uuid: string,
    n?: ParsedPn,
  ) => {
    this.setAutoEndCallKeepTimer(uuid, n)
    if (!uuid || !n) {
      return
    }
    if (n.sipPn.autoAnswer && !this.calls.some(c => c.callkeepUuid !== uuid)) {
      if (RnAppState.foregroundOnce && AppState.currentState !== 'active') {
        RNCallKeep.backToForeground()
      }
      BackgroundTimer.setTimeout(() => {
        if (Platform.OS === 'ios') {
          RNCallKeep.answerIncomingCall(uuid)
        }
        BrekekeUtils.onCallKeepAction(uuid, 'answerCall')
      }, 2000)
    }
    checkAndRemovePnTokenViaSip(n)
    // find the current incoming call which is not callkeep
    // assign the data and config
    const c = this.getCallKeep(uuid)
    if (c) {
      c.callkeepUuid = uuid
      BrekekeUtils.setCallConfig(uuid, JSON.stringify(c.callConfig))
    }
    // check if call is rejected already
    const rejected = this.isCallRejected({
      callkeepUuid: uuid,
      pnId: n.id,
    })
    // check if call is expired already
    let expired = false
    const d = await accountStore.findDataByPn(n)
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
    if (now - this.recentCallActivityAt > 3000) {
      const as = getAuthStore()
      if (as.sipState === 'connecting') {
        return
      }
      const count = sip.phone?.getSessionCount()
      if (!count) {
        console.log(
          `SIP PN debug: new notification: phone.getSessionCount()=${count} | call destroyWebRTC()`,
        )
        as.sipState = 'stopped'
        sip.destroyWebRTC()
        authSIP.authWithCheck()
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
      includingRejected: Platform.OS === 'android',
      includingOutgoing: Platform.OS === 'ios',
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
      const ca = getAuthStore().getCurrentAccount()
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
    const ca = getAuthStore().getCurrentAccount()
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
  onCallUpsert: CallStore['upsertCall'] = c => {
    this.upsertCall(c)
    if (
      Platform.OS === 'android' &&
      !this.incallManagerStarted &&
      this.calls.find(_ => _.answered || !_.incoming)
    ) {
      this.incallManagerStarted = true
      IncallManager.start()
    }
  }
  @action private upsertCall = (
    // partial
    p: Pick<Call, 'id'> & Partial<Omit<Call, 'id'>>,
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
        BrekekeUtils.setCallConfig(e.callkeepUuid, JSON.stringify(e.callConfig))
      }
      if (p.rawSession && e.rawSession) {
        Object.assign(e.rawSession, p.rawSession)
        delete p.rawSession
      }
      if (
        p.videoSessionId &&
        e.videoSessionId &&
        p.videoSessionId !== e.videoSessionId &&
        !p.remoteVideoEnabled
      ) {
        delete p.videoSessionId
        delete p.remoteVideoEnabled
        delete p.remoteVideoStreamObject
      }
      if (!e.answered && p.answered) {
        e.answerCallKeep()
        p.answeredAt = now
        BrekekeUtils.onCallConnected(e.callkeepUuid)
        this.prevDisplayingCallId = e.id
        BrekekeUtils.setSpeakerStatus(this.isLoudSpeakerEnabled)
      }
      Object.assign(e, p, {
        withSDPControls: e.withSDPControls || p.withSDP,
      })
      if (e.incoming && e.callkeepUuid) {
        BrekekeUtils.setRemoteVideoStreamUrl(
          e.callkeepUuid,
          e.remoteVideoStreamObject ? e.remoteVideoStreamObject.toURL() : '',
        )
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
        BrekekeUtils.setIsVideoCall(e.callkeepUuid, !!e.localVideoEnabled)
      }
      // emit to embed api
      if (!window._BrekekePhoneWebRoot) {
        embedApi.emit('call_update', e)
      }
      return
    }
    //
    // construct a new call
    const c = new Call(this)
    Object.assign(c, p)
    this.calls = [c, ...this.calls]
    this.displayingCallId = c.id // do not set ongoing call
    // update java and embed api
    BrekekeUtils.setJsCallsSize(this.calls.length)
    // emit to embed api
    if (!window._BrekekePhoneWebRoot) {
      embedApi.emit('call', c)
    }
    // desktop notification
    if (Platform.OS === 'web' && c.incoming && !c.answered) {
      webShowNotification(
        c.getDisplayName() + ' ' + intl`Incoming call`,
        c.getDisplayName(),
      )
    }
    if (!c.incoming && !c.callkeepUuid && this.callkeepUuidPending) {
      c.callkeepUuid = this.callkeepUuidPending
      this.callkeepUuidPending = ''
    }
    const ca = getAuthStore().getCurrentAccount()
    if (
      Platform.OS !== 'web' &&
      c.incoming &&
      !c.callkeepUuid &&
      !ca?.pushNotificationEnabled
    ) {
      const uuid = newUuid().toUpperCase()
      c.callkeepUuid = uuid
      RNCallKeep.displayIncomingCall(
        uuid,
        c.partyNumber,
        c.getDisplayName(),
        'generic',
      )
    }
    // get and check callkeep if pending incoming call
    if (Platform.OS === 'web' || !c.incoming || c.answered) {
      return
    }
    c.callkeepUuid = c.callkeepUuid || this.getUuidFromPnId(c.pnId) || ''
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

  @action onCallRemove = async (rawSession: Session) => {
    this.updateCurrentCallDebounce()
    this.recentCallActivityAt = Date.now()
    const c = this.calls.find(_ => _.id === rawSession.sessionId)
    if (!c) {
      return
    }
    if (c.rawSession) {
      Object.assign(c.rawSession, rawSession)
    } else {
      c.rawSession = rawSession
    }
    this.onSipUaCancel({ pnId: c.pnId })
    if (c.callkeepUuid) {
      this.endCallKeep(c.callkeepUuid)
    }
    await addCallHistory(c)
    c.callkeepUuid = ''
    c.callkeepAlreadyRejected = true

    this.calls = this.calls.filter(c0 => c0 !== c)
    // set number of total calls in our custom java incoming call module
    BrekekeUtils.setJsCallsSize(this.calls.length)
    // when if this is a outgoing call, try to insert a call history to uc chat
    if (getAuthStore().ucState === 'success' && c.answeredAt && !c.incoming) {
      uc.sendCallResult(c.getDuration(), c.partyNumber)
    }
    // reset loud speaker if there's no call left
    if (Platform.OS !== 'web' && !this.calls.length) {
      this.isLoudSpeakerEnabled = false
      if (Platform.OS === 'ios') {
        IncallManager.setForceSpeakerphoneOn(false)
      }
    }
    // stop android incall manager if there's no call left
    if (
      Platform.OS === 'android' &&
      this.incallManagerStarted &&
      !this.calls.length
    ) {
      this.incallManagerStarted = false
      IncallManager.stop()
    }
    // emit to embed api
    if (!window._BrekekePhoneWebRoot) {
      embedApi.emit('call_end', c)
    }
  }

  @action onSelectBackgroundCall = async (c: Immutable<Call>) => {
    this.setCurrentCallId(c.id)
    Nav().backToPageCallManage()
    await waitTimeout()
    if (c.holding) {
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
    if (!(await permForCall())) {
      return
    }
    if (
      this.callkeepUuidPending ||
      this.calls.filter(c => !c.incoming && !c.answered).length
    ) {
      RnAlert.error({
        message: intlDebug`There is already an outgoing call`,
      })
      return
    }
    // start call logic in RNCallKeep
    // adding this will help the outgoing call automatically hold on GSM call
    let uuid = ''
    if (Platform.OS !== 'web') {
      uuid = newUuid().toUpperCase()
      this.callkeepUuidPending = uuid
      if (Platform.OS == 'android') {
        RNCallKeep.startCall(uuid, 'Brekeke phone', number)
      } else {
        RNCallKeep.startCall(uuid, number, number, 'generic', false)
      }
      this.setAutoEndCallKeepTimer(uuid)
    }
    const sipCreateSession = () => {
      // do not make call if the callkeep ended
      if (uuid && uuid !== this.callkeepUuidPending) {
        return
      }
      sip.phone?.makeCall(number, ...args)
    }
    // reset sip connection state and navigate to the call manage screen
    const as = getAuthStore()
    as.sipTotalFailure = 0
    Nav().goToPageCallManage({ isOutgoingCall: true })
    if (
      as.sipState === 'waiting' ||
      as.sipState === 'failure' ||
      as.sipState === 'stopped'
    ) {
      reconnectAndWaitSip().then(sipCreateSession)
      return
    }
    if (as.sipState === 'connecting') {
      waitSip().then(sipCreateSession)
      return
    }
    // in case of sip state is success
    // there could still cases that the sip is disconnected but state not updated yet
    // like putting the phone on background or changing the network
    let reconnectCalled = false
    try {
      sipCreateSession()
    } catch (err) {
      reconnectCalled = true
      reconnectAndWaitSip().then(sipCreateSession)
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
          reconnectAndWaitSip().then(sipCreateSession)
          this.clearStartCallIntervalTimer()
        }
      }),
      500,
    )
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
    300,
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
  private updateCurrentCallDebounce = debounce(this.updateCurrentCall, 300, {
    maxWait: 1000,
  })

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

  // logic to end call if timeout of 20s
  private autoEndCallKeepTimerId = 0
  private clearAutoEndCallKeepTimer = () => {
    if (Platform.OS === 'web' || !this.autoEndCallKeepTimerId) {
      return
    }
    BackgroundTimer.clearInterval(this.autoEndCallKeepTimerId)
    this.autoEndCallKeepTimerId = 0
  }
  @action private setAutoEndCallKeepTimer = (
    uuid: string,
    incomingPnData?: ParsedPn,
  ) => {
    if (Platform.OS === 'web') {
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
    }: {
      setAction?: boolean
      completedElseWhere?: boolean
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
    const pnData = this.callkeepMap[uuid]?.incomingPnData
    if (
      pnData &&
      !this.calls.some(c => c.callkeepUuid === uuid || c.pnId === pnData.id) &&
      !completedElseWhere
    ) {
      addCallHistory(pnData)
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
    if (Platform.OS !== 'web') {
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

  getCallInNotify = () => {
    // do not display our callbar if already show callkeep
    return this.calls.find(_ => {
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
  }
  shouldRingInNotify = (uuid?: string) => {
    if (Platform.OS === 'web') {
      return true
    }
    const ca = getAuthStore().getCurrentAccount()
    // do not ring if PN is turned on
    if (ca?.pushNotificationEnabled) {
      return false
    }
    // do not ring in ios even if PN is turned off
    // since we already show the call via RNCallKeep in js code
    if (Platform.OS === 'ios') {
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
      })
    }
  }

  constructor() {
    if (Platform.OS !== 'android') {
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
      }, 300)
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
    if (Platform.OS === 'web') {
      return
    }
    this.isLoudSpeakerEnabled = !this.isLoudSpeakerEnabled
    if (Platform.OS === 'ios') {
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
  // to set ringtone in CallVoicesUI.web.tsx
  @observable ringtone = ''
  @action setIncomingRingtone = (ringtone: string) => {
    this.ringtone = ringtone
  }
}

const callStore = new CallStore()
setCallStore(callStore)

export type TCallKeepAction = 'answerCall' | 'rejectCall'
type TCallKeepIds = Partial<Pick<Call, 'callkeepUuid' | 'pnId'>>
