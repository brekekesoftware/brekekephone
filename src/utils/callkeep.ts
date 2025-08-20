import {
  AppState,
  Keyboard,
  NativeEventEmitter,
  ToastAndroid,
} from 'react-native'
import type { EventsPayload } from 'react-native-callkeep'
import RNCallKeep from 'react-native-callkeep'

import { bundleIdentifier, isAndroid, isIos, isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { RnKeyboard } from '#/stores/RnKeyboard'
import { RnPicker } from '#/stores/RnPicker'
import { RnStacker } from '#/stores/RnStacker'
import { BrekekeUtils } from '#/utils/BrekekeUtils'
import { cleanUpDeepLink } from '#/utils/deeplink'
import { parse, parseNotificationData } from '#/utils/PushNotification-parse'
import { waitTimeout } from '#/utils/waitTimeout'

let alreadySetupCallKeep = false

const setupCallKeep = async () => {
  if (alreadySetupCallKeep) {
    return
  }
  // do not re-setup ios when having an ongoing call
  // https://github.com/react-native-webrtc/react-native-callkeep/issues/367#issuecomment-804923269
  if (isIos) {
    if (AppState.currentState !== 'active') {
      return
    }
    if (Object.keys(ctx.call.callkeepMap).length) {
      return
    }
    const map = await RNCallKeep.getCalls()
    if (map && Object.keys(map).length) {
      return
    }
  }

  alreadySetupCallKeep = true
  const option = {
    android: {
      alertTitle: intl`Permissions required`,
      alertDescription: intl`${ctx.global.productName} needs to your permission to display calls`,
      cancelButton: intl`Cancel`,
      okButton: 'OK',
      imageName: 'phone_account_icon',
      additionalPermissions: [],
      foregroundService: {
        channelId: bundleIdentifier,
        channelName: intl`Background service for ${ctx.global.productName}`,
        notificationTitle: intl`${ctx.global.productName} is running on background`,
        notificationIcon: 'ic_launcher',
      },
      selfManaged: true,
    },
  }
  await RNCallKeep.setup(option)
    .then(() => {
      RNCallKeep.registerPhoneAccount(option)
      RNCallKeep.registerAndroidEvents()
      RNCallKeep.setAvailable(true)
      RNCallKeep.canMakeMultipleCalls(true)
    })
    .catch((err: Error) => {
      if (AppState.currentState !== 'active') {
        console.error('RNCallKeep.setup error:', err)
        return
      }
      RnAlert.error({
        message: intlDebug`Can not get permission to show call notification`,
        err,
      })
    })
}

export type TEvent = {
  callUUID: string
}
export type TEventDidLoad = {
  name: string
  data: unknown
}

export const setupCallKeepEvents = async () => {
  if (isWeb) {
    return
  }
  await setupCallKeep()

  const didLoadWithEvents = (e: EventsPayload['didLoadWithEvents']) => {
    e.forEach(_ => didLoadWithEventsHandlers[_.name]?.(_.data))
  }
  const answerCall = (e: EventsPayload['answerCall']) => {
    const uuid = e.callUUID.toUpperCase()
    if (isAndroid) {
      // handle action from CallKeep Notification on android
      BrekekeUtils.onCallKeepAction(uuid, 'answerCall')
    } else {
      ctx.call.onCallKeepAnswerCall(uuid)
    }
  }
  const endCall = (e: EventsPayload['endCall']) => {
    const uuid = e.callUUID.toUpperCase()
    if (isAndroid) {
      // handle action from CallKeep Notification on android
      BrekekeUtils.onCallKeepAction(uuid, 'rejectCall')
    } else {
      ctx.call.setCalleeRejected({ callkeepUuid: uuid })
      ctx.call.onCallKeepEndCall(uuid)
    }
    // try to setup callkeep on each endcall if not yet
    setupCallKeep()
  }
  const didDisplayIncomingCall = (
    e: EventsPayload['didDisplayIncomingCall'],
  ) => {
    const uuid = e.callUUID.toUpperCase()
    // use the custom native incoming call module for android
    if (isAndroid) {
      return
    }
    const n = parseNotificationData(e.payload)
    console.log(
      `SIP PN debug: callkeep.didDisplayIncomingCall has e.payload: ${!!e.payload} found pnData: ${!!n}`,
    )
    ctx.call.onCallKeepDidDisplayIncomingCall(uuid, n)
    if (!n) {
      // when PN is off we will manually call RNCallKeep.displayIncomingCall
      // pnData will be empty here
      return
    }
    ctx.auth.signInByNotification(n)
  }
  const didPerformSetMutedCallAction = (
    e: EventsPayload['didPerformSetMutedCallAction'],
  ) => {
    // [RNCallKeepModule][onReceive] ACTION_UNMUTE_CALL
    // for android when enable speaker, RNCallKeep will auto set unmute for call
    // we use custom UI for android then user will never interact with the native UI
    // this event can be ignored for android to fix the issue with loud speaker
    if (isAndroid) {
      return
    }
    const uuid = e.callUUID.toUpperCase()
    const c = ctx.call.calls.find(_ => _.callkeepUuid === uuid)
    if (c && c.muted !== e.muted) {
      c.toggleMuted()
    }
  }
  const didToggleHoldCallAction = (
    e: EventsPayload['didToggleHoldCallAction'],
  ) => {
    const uuid = e.callUUID.toUpperCase()
    const c = ctx.call.calls.find(_ => _.callkeepUuid === uuid)
    // in case the user has not answered the call on callkeep display incoming call
    // audio session should not be assigned to WebRTC
    // before the didActivateAudioSession event is called
    if (isIos && c?.isAutoAnswer && !c.isAudioActive) {
      return
    }
    if (c && c.holding !== e.hold) {
      c.toggleHoldWithCheck()
    }
    BrekekeUtils.webrtcSetAudioEnabled(!e.hold)
  }
  const didPerformDTMFAction = (e: EventsPayload['didPerformDTMFAction']) => {
    const uuid = e.callUUID.toUpperCase()
    const c = ctx.call.calls.find(_ => _.callkeepUuid === uuid)
    if (c) {
      ctx.sip.sendDTMF({
        sessionId: c.id,
        signal: e.digits.charAt(e.digits.length - 1),
        talkerId: c.pbxTalkerId,
        tenant: c.pbxTenant,
      })
    }
  }
  const didActivateAudioSession = (
    e: EventsPayload['didActivateAudioSession'],
  ) => {
    // only in ios
    console.log('CallKeep debug: didActivateAudioSession')
    const c = ctx.call.getOngoingCall()
    if (c?.isAutoAnswer) {
      c.isAudioActive = true
      c.partyAnswered && c.setHoldWithoutCallKeep(false)
    }
    BrekekeUtils.webrtcSetAudioEnabled(true)
  }
  const didDeactivateAudioSession = (
    e: EventsPayload['didDeactivateAudioSession'],
  ) => {
    // only in ios
    console.log('CallKeep debug: didDeactivateAudioSession')
    BrekekeUtils.webrtcSetAudioEnabled(false)
    ctx.call.updateBackgroundCalls()
  }
  const didReceiveStartCallAction = async (
    e: EventsPayload['didReceiveStartCallAction'],
  ) => {
    // only in ios
    console.log('CallKeep debug: didReceiveStartCallAction', e)
    if (e?.callUUID) {
      // our RNCallKeep.startCall
      return
    }
    if (!(await ctx.auth.autoSignInLast())) {
      return
    }
    await ctx.auth.waitSip()
    ctx.call.startCall(e.handle)
  }

  // https://github.com/react-native-webrtc/react-native-callkeep#didloadwithevents
  const didLoadWithEventsHandlers: { [k: string]: Function } = {
    RNCallKeepPerformAnswerCallAction: answerCall,
    RNCallKeepPerformEndCallAction: endCall,
    RNCallKeepDidDisplayIncomingCall: didDisplayIncomingCall,
    RNCallKeepDidPerformSetMutedCallAction: didPerformSetMutedCallAction,
    RNCallKeepDidToggleHoldAction: didToggleHoldCallAction,
    RNCallKeepDidPerformDTMFAction: didPerformDTMFAction,
    RNCallKeepDidActivateAudioSession: didActivateAudioSession,
    RNCallKeepDidDeactivateAudioSession: didDeactivateAudioSession,
    RNCallKeepDidReceiveStartCallAction: didReceiveStartCallAction,
  }
  const add = RNCallKeep.addEventListener
  add('didLoadWithEvents', didLoadWithEvents)
  add('answerCall', answerCall)
  add('endCall', endCall)
  add('didDisplayIncomingCall', didDisplayIncomingCall)
  add('didPerformSetMutedCallAction', didPerformSetMutedCallAction)
  add('didToggleHoldCallAction', didToggleHoldCallAction)
  add('didPerformDTMFAction', didPerformDTMFAction)
  add('didActivateAudioSession', didActivateAudioSession)
  add('didDeactivateAudioSession', didDeactivateAudioSession)
  add('didReceiveStartCallAction', didReceiveStartCallAction)

  // android self-managed connection service
  if (!isAndroid) {
    return
  }

  // in killed state, the event handler may fire before the nav object has init
  const waitTimeoutNav = async () => {
    const t = RnStacker.stacks.some(s => s.isRoot) ? 300 : 1000
    await waitTimeout(t)
  }

  // events from our custom BrekekeUtils module
  const eventEmitter = new NativeEventEmitter(BrekekeUtils)

  eventEmitter.addListener('lpcIncomingCall', (v: string) => {
    parse(JSON.parse(v))
  })

  eventEmitter.addListener('answerCall', async (uuid: string) => {
    // should update the native android UI here to fix a case with auto answer
    const c = ctx.call.calls.find(_ => _.callkeepUuid === uuid && _.answered)
    if (c) {
      if (isAndroid) {
        // with auto answer, talkingAvatar takes too long to update
        BrekekeUtils.setTalkingAvatar(
          uuid,
          c.talkingImageUrl,
          c.partyImageSize === 'large',
        )
        await waitTimeout(17)
      }
      BrekekeUtils.onCallConnected(uuid)
    }
    ctx.call.onCallKeepAnswerCall(uuid.toUpperCase())
    RNCallKeep.setOnHold(uuid, false)
  })
  eventEmitter.addListener('rejectCall', (uuid: string) => {
    if (uuid.startsWith('CalleeClickReject-')) {
      uuid = uuid.replace('CalleeClickReject-', '').toUpperCase()
      ctx.call.setCalleeRejected({ callkeepUuid: uuid })
    } else {
      uuid = uuid.toUpperCase()
    }
    ctx.call.onCallKeepEndCall(uuid)
  })
  eventEmitter.addListener('transfer', async (uuid: string) => {
    await waitTimeoutNav()
    ctx.nav.goToPageCallTransferChooseUser()
  })
  eventEmitter.addListener('showBackgroundCall', async (uuid: string) => {
    await waitTimeoutNav()
    ctx.nav.goToPageCallBackgrounds()
  })
  eventEmitter.addListener('park', async (uuid: string) => {
    await waitTimeoutNav()
    ctx.nav.goToPageCallParksOngoing()
  })
  eventEmitter.addListener('video', (uuid: string) => {
    ctx.call.getOngoingCall()?.toggleVideo()
  })
  eventEmitter.addListener('speaker', (uuid: string) => {
    ctx.call.toggleLoudSpeaker()
  })
  eventEmitter.addListener('mute', (uuid: string) => {
    ctx.call.getOngoingCall()?.toggleMuted()
  })
  eventEmitter.addListener('record', (uuid: string) => {
    ctx.call.getOngoingCall()?.toggleRecording()
  })
  eventEmitter.addListener('dtmf', async (uuid: string) => {
    await waitTimeoutNav()
    ctx.nav.goToPageCallDtmfKeypad()
  })
  eventEmitter.addListener('hold', (uuid: string) => {
    ctx.call.getOngoingCall()?.toggleHoldWithCheck()
  })
  eventEmitter.addListener('switchCamera', (uuid: string) => {
    ctx.call.getOngoingCall()?.toggleSwitchCamera()
  })
  eventEmitter.addListener('switchCall', (uuid: string) => {
    const oc = ctx.call.getOngoingCall()
    const c = ctx.call.calls.find(i => i.callkeepUuid === uuid)
    if (!c || c.id === oc?.id || !oc?.answered) {
      return
    }
    ctx.call.onSelectBackgroundCall(c)
  })
  eventEmitter.addListener('phonePermission', () => {
    console.log(
      'CallKeep debug: phonePermission currentState' + AppState.currentState,
    )
    if (AppState.currentState === 'active') {
      ToastAndroid.showWithGravity(
        intl`Incoming call blocked. Please allow phone permission in settings to receive calls`,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
      )
    }
  })
  // other utils
  eventEmitter.addListener('onIncomingCallActivityBackPressed', () => {
    if (!RnStacker.stacks.length) {
      ctx.nav.goToPageIndex()
    } else {
      RnStacker.stacks = [RnStacker.stacks[0]]
    }
    ctx.call.inPageCallManage = undefined
  })
  eventEmitter.addListener('onBackPressed', onBackPressed)
  eventEmitter.addListener('onIncomingCallActivityBackPressed', () => {
    if (!RnStacker.stacks.length) {
      ctx.nav.goToPageIndex()
    } else {
      RnStacker.stacks = [RnStacker.stacks[0]]
    }
    ctx.call.inPageCallManage = undefined
  })
  eventEmitter.addListener('updateStreamActive', (vId: string) => {
    ctx.call.getOngoingCall()?.updateVideoStreamFromNative(vId)
  })
  eventEmitter.addListener('debug', (m: string) =>
    console.log(`Android debug: ${m}`),
  )
  eventEmitter.addListener('error', (m: string) =>
    console.error(`Android error: ${m}`),
  )
  // android native video conference
  eventEmitter.addListener('navChat', async (uuid: string) => {
    await waitTimeoutNav()
    const chatId = ctx.call.getOngoingCall()?.partyNumber
    if (!chatId) {
      return
    }
    if (chatId.startsWith('uc')) {
      ctx.nav.goToPageChatGroupDetail({ groupId: chatId.replace('uc', '') })
    } else {
      ctx.nav.goToPageChatDetail({ buddy: chatId })
    }
  })
  // TODO: should check additional conditions when user switches between activities
  eventEmitter.addListener('onResume', () => ctx.pbx.ping())

  eventEmitter.addListener('onDestroyMainActivity', () => {
    console.log('clean up because of onDestroyMainActivity')
    cleanUpDeepLink()
    ctx.auth.signOut()
  })
}

export const onBackPressed = () => {
  if (RnKeyboard.isKeyboardShowing) {
    Keyboard.dismiss()
    return true
  }
  if (RnAlert.alerts.length) {
    RnAlert.dismiss()
    return true
  }
  if (RnPicker.currentRnPicker) {
    RnPicker.dismiss()
    return true
  }
  if (ctx.call.inPageCallManage) {
    ctx.call.inPageCallManage = undefined
    return true
  }
  if (RnStacker.stacks.length > 1) {
    RnStacker.stacks.pop()
    return true
  }
  BrekekeUtils.backToBackground()
  return true
}
