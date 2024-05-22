import { AppState, Keyboard, NativeEventEmitter, Platform } from 'react-native'
import type { EventsPayload } from 'react-native-callkeep'
import RNCallKeep from 'react-native-callkeep'

import { sip } from '../api/sip'
import { bundleIdentifier } from '../config'
import { getAuthStore, waitSip } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { RnKeyboard } from '../stores/RnKeyboard'
import { RnPicker } from '../stores/RnPicker'
import { RnStacker } from '../stores/RnStacker'
import { parseNotificationData } from './PushNotification-parse'
import { BrekekeUtils } from './RnNativeModules'
import { waitTimeout } from './waitTimeout'

let alreadySetupCallKeep = false

const setupCallKeep = async () => {
  if (alreadySetupCallKeep) {
    return
  }
  const cs = getCallStore()

  // do not re-setup ios when having an ongoing call
  // https://github.com/react-native-webrtc/react-native-callkeep/issues/367#issuecomment-804923269
  if (Platform.OS === 'ios') {
    if (AppState.currentState !== 'active') {
      return
    }
    if (Object.keys(cs.callkeepMap).length) {
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
      alertDescription: intl`Brekeke Phone needs to your permission to display calls`,
      cancelButton: intl`Cancel`,
      okButton: 'OK',
      imageName: 'phone_account_icon',
      additionalPermissions: [],
      foregroundService: {
        channelId: bundleIdentifier,
        channelName: intl`Background service for Brekeke Phone`,
        notificationTitle: intl`Brekeke Phone is running on background`,
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
  if (Platform.OS === 'web') {
    return
  }
  const cs = getCallStore()
  await setupCallKeep()

  const didLoadWithEvents = (e: EventsPayload['didLoadWithEvents']) => {
    e.forEach(_ => didLoadWithEventsHandlers[_.name]?.(_.data))
  }
  const answerCall = (e: EventsPayload['answerCall']) => {
    const uuid = e.callUUID.toUpperCase()
    if (Platform.OS === 'android') {
      // handle action from CallKeep Notification on android
      BrekekeUtils.onCallKeepAction(uuid, 'answerCall')
    } else {
      cs.onCallKeepAnswerCall(uuid)
    }
  }
  const endCall = (e: EventsPayload['endCall']) => {
    const uuid = e.callUUID.toUpperCase()
    if (Platform.OS === 'android') {
      // handle action from CallKeep Notification on android
      BrekekeUtils.onCallKeepAction(uuid, 'rejectCall')
    } else {
      cs.setCalleeRejected({ callkeepUuid: uuid })
      cs.onCallKeepEndCall(uuid)
    }
    // try to setup callkeep on each endcall if not yet
    setupCallKeep()
  }
  const didDisplayIncomingCall = (
    e: EventsPayload['didDisplayIncomingCall'],
  ) => {
    const uuid = e.callUUID.toUpperCase()
    // use the custom native incoming call module for android
    if (Platform.OS === 'android') {
      return
    }
    const n = parseNotificationData(e.payload)
    console.log(
      `SIP PN debug: callkeep.didDisplayIncomingCall has e.payload: ${!!e.payload} found pnData: ${!!n}`,
    )
    cs.onCallKeepDidDisplayIncomingCall(uuid, n)
    if (!n) {
      // when PN is off we will manually call RNCallKeep.displayIncomingCall
      // pnData will be empty here
      return
    }
    getAuthStore().signInByNotification(n)
  }
  const didPerformSetMutedCallAction = (
    e: EventsPayload['didPerformSetMutedCallAction'],
  ) => {
    // [RNCallKeepModule][onReceive] ACTION_UNMUTE_CALL
    // for android when enable speaker, RNCallKeep will auto set unmute for call
    // we use custom UI for android then user will never interact with the native UI
    // this event can be ignored for android to fix the issue with loud speaker
    if (Platform.OS === 'android') {
      return
    }
    const uuid = e.callUUID.toUpperCase()
    const c = cs.calls.find(_ => _.callkeepUuid === uuid)
    if (c && c.muted !== e.muted) {
      c.toggleMuted()
    }
  }
  const didToggleHoldCallAction = (
    e: EventsPayload['didToggleHoldCallAction'],
  ) => {
    const uuid = e.callUUID.toUpperCase()
    const c = cs.calls.find(_ => _.callkeepUuid === uuid)
    if (c && c.holding !== e.hold) {
      c.toggleHoldWithCheck()
    }
    BrekekeUtils.webrtcSetAudioEnabled(!e.hold)
  }
  const didPerformDTMFAction = (e: EventsPayload['didPerformDTMFAction']) => {
    const uuid = e.callUUID.toUpperCase()
    const c = cs.calls.find(_ => _.callkeepUuid === uuid)
    if (c) {
      sip.sendDTMF({
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
    BrekekeUtils.webrtcSetAudioEnabled(true)
  }
  const didDeactivateAudioSession = (
    e: EventsPayload['didDeactivateAudioSession'],
  ) => {
    // only in ios
    console.log('CallKeep debug: didDeactivateAudioSession')
    BrekekeUtils.webrtcSetAudioEnabled(false)
    cs.updateBackgroundCalls()
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
    if (!(await getAuthStore().autoSignInLast())) {
      return
    }
    await waitSip()
    getCallStore().startCall(e.handle)
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

  if (Platform.OS !== 'android') {
    return
  }

  // android self-managed connection service
  const nav = Nav()

  // in killed state, the event handler may fire before the nav object has init
  const waitTimeoutNav = async () => {
    const t = RnStacker.stacks.some(s => s.isRoot) ? 300 : 1000
    await waitTimeout(t)
  }

  // events from our custom BrekekeUtils module
  const eventEmitter = new NativeEventEmitter(BrekekeUtils)
  eventEmitter.addListener('answerCall', (uuid: string) => {
    // should update the native android UI here to fix a case with auto answer
    const c = cs.calls.find(_ => _.callkeepUuid === uuid && _.answered)
    if (c) {
      BrekekeUtils.setTalkingAvatar(
        uuid,
        c.talkingImageUrl,
        c.partyImageSize === 'large',
      )
    }
    cs.onCallKeepAnswerCall(uuid.toUpperCase())
    RNCallKeep.setOnHold(uuid, false)
  })
  eventEmitter.addListener('rejectCall', (uuid: string) => {
    if (uuid.startsWith('CalleeClickReject-')) {
      uuid = uuid.replace('CalleeClickReject-', '').toUpperCase()
      cs.setCalleeRejected({ callkeepUuid: uuid })
    } else {
      uuid = uuid.toUpperCase()
    }
    cs.onCallKeepEndCall(uuid)
  })
  eventEmitter.addListener('transfer', async (uuid: string) => {
    await waitTimeoutNav()
    nav.goToPageCallTransferChooseUser()
  })
  eventEmitter.addListener('showBackgroundCall', async (uuid: string) => {
    await waitTimeoutNav()
    nav.goToPageCallBackgrounds()
  })
  eventEmitter.addListener('park', async (uuid: string) => {
    await waitTimeoutNav()
    nav.goToPageCallParks2()
  })
  eventEmitter.addListener('video', (uuid: string) => {
    cs.getOngoingCall()?.toggleVideo()
  })
  eventEmitter.addListener('speaker', (uuid: string) => {
    cs.toggleLoudSpeaker()
  })
  eventEmitter.addListener('mute', (uuid: string) => {
    cs.getOngoingCall()?.toggleMuted()
  })
  eventEmitter.addListener('record', (uuid: string) => {
    cs.getOngoingCall()?.toggleRecording()
  })
  eventEmitter.addListener('dtmf', async (uuid: string) => {
    await waitTimeoutNav()
    nav.goToPageCallDtmfKeypad()
  })
  eventEmitter.addListener('hold', (uuid: string) => {
    cs.getOngoingCall()?.toggleHoldWithCheck()
  })
  eventEmitter.addListener('switchCamera', (uuid: string) => {
    cs.getOngoingCall()?.toggleSwitchCamera()
  })
  eventEmitter.addListener('switchCall', (uuid: string) => {
    const oc = cs.getOngoingCall()
    const c = cs.calls.find(i => i.callkeepUuid === uuid)
    if (!c || c.id === oc?.id || !oc?.answered) {
      return
    }
    cs.onSelectBackgroundCall(c)
  })
  eventEmitter.addListener('makeCall', async (phoneNumber: string) => {
    if (!(await getAuthStore().autoSignInLast())) {
      return
    }
    await waitSip()
    getCallStore().startCall(phoneNumber)
  })
  // other utils
  eventEmitter.addListener('onBackPressed', onBackPressed)
  eventEmitter.addListener('onIncomingCallActivityBackPressed', () => {
    if (!RnStacker.stacks.length) {
      nav.goToPageIndex()
    } else {
      RnStacker.stacks = [RnStacker.stacks[0]]
    }
    cs.inPageCallManage = undefined
  })
  eventEmitter.addListener('debug', (m: string) =>
    console.log(`Android debug: ${m}`),
  )
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
  const cs = getCallStore()
  if (cs.inPageCallManage) {
    cs.inPageCallManage = undefined
    return true
  }
  if (RnStacker.stacks.length > 1) {
    RnStacker.stacks.pop()
    return true
  }
  BrekekeUtils.backToBackground()
  return true
}
