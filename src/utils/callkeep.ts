import { AppState, Keyboard, NativeEventEmitter, Platform } from 'react-native'
import RNCallKeep, { EventsPayload } from 'react-native-callkeep'

import { sip } from '../api/sip'
import { getAuthStore } from '../stores/authStore'
import { hackyToggleSpeaker } from '../stores/Call'
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

const setupCallKeepWithCheck = async () => {
  if (alreadySetupCallKeep) {
    return
  }

  // do not re-setup ios calls
  // https://github.com/react-native-webrtc/react-native-callkeep/issues/367#issuecomment-804923269
  if (
    Platform.OS === 'ios' &&
    (Object.keys((await RNCallKeep.getCalls()) || {}).length ||
      Object.keys(getCallStore().callkeepMap).length ||
      AppState.currentState !== 'active')
  ) {
    return
  }

  alreadySetupCallKeep = true
  const option = {
    ios: {
      appName: 'Brekeke Phone',
      // already put this on our fork to display our logo before js load
      imageName: 'callkit.png',
      // https://github.com/react-native-webrtc/react-native-callkeep/issues/193
      // https://github.com/react-native-webrtc/react-native-callkeep/issues/181
      supportsVideo: false,
    },
    android: {
      alertTitle: intl`Permissions required`,
      alertDescription: intl`Brekeke Phone needs to your permission to display calls`,
      cancelButton: intl`Cancel`,
      okButton: 'OK',
      imageName: 'phone_account_icon',
      additionalPermissions: [],
      foregroundService: {
        channelId: 'com.brekeke.phone',
        channelName: intl`Background service for Brekeke Phone`,
        notificationTitle: intl`Brekeke Phone is running on background`,
        notificationIcon: 'ic_launcher',
      },
      selfManaged: true,
    },
  }
  await RNCallKeep.setup(option)
    .then(() => {
      if (Platform.OS === 'android') {
        RNCallKeep.registerPhoneAccount(option)
        RNCallKeep.registerAndroidEvents()
        RNCallKeep.setAvailable(true)
        RNCallKeep.canMakeMultipleCalls(true)
      }
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

export const setupCallKeep = async () => {
  if (Platform.OS === 'web') {
    return
  }

  await setupCallKeepWithCheck()

  const didLoadWithEvents = (e: EventsPayload['didLoadWithEvents']) => {
    e.forEach(_ => didLoadWithEventsHandlers[_.name]?.(_.data))
  }
  const answerCall = (e: EventsPayload['answerCall']) => {
    const uuid = e.callUUID.toUpperCase()
    if (Platform.OS === 'android') {
      // handle action from CallKeep Notification on android
      BrekekeUtils.onCallKeepAction(uuid, 'answerCall')
    } else {
      getCallStore().onCallKeepAnswerCall(uuid)
    }
  }
  const endCall = (e: EventsPayload['endCall']) => {
    const uuid = e.callUUID.toUpperCase()
    const cs = getCallStore()
    if (Platform.OS === 'android') {
      // handle action from CallKeep Notification on android
      BrekekeUtils.onCallKeepAction(uuid, 'rejectCall')
    } else {
      cs.setCalleeRejected({ callkeepUuid: uuid })
      cs.onCallKeepEndCall(uuid)
    }
    // try to setup callkeep on each endcall if not yet
    setupCallKeepWithCheck()
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
    if (n) {
      getAuthStore().signInByNotification(n)
      getCallStore().onCallKeepDidDisplayIncomingCall(uuid, n)
    } else {
      console.log('SIP PN debug: call RNCallKeep.endCall: pnData not found')
      RNCallKeep.endCall(uuid)
    }
  }
  const didPerformSetMutedCallAction = (
    e: EventsPayload['didPerformSetMutedCallAction'],
  ) => {
    const uuid = e.callUUID.toUpperCase()
    const c = getCallStore().calls.find(_ => _.callkeepUuid === uuid)
    if (c && c.muted !== e.muted) {
      c.toggleMuted()
    }
  }
  const didToggleHoldCallAction = (
    e: EventsPayload['didToggleHoldCallAction'],
  ) => {
    const uuid = e.callUUID.toUpperCase()
    const c = getCallStore().calls.find(_ => _.callkeepUuid === uuid)
    if (c && c.holding !== e.hold) {
      c.toggleHoldWithCheck()
    }
  }
  const didPerformDTMFAction = (e: EventsPayload['didPerformDTMFAction']) => {
    const uuid = e.callUUID.toUpperCase()
    const c = getCallStore().calls.find(_ => _.callkeepUuid === uuid)
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
    // TODO:
    // hackyToggleSpeaker is only to fix some cases in multi calls
    // here if we call it, it may affect other cases such as single call?
    hackyToggleSpeaker()
  }
  const didDeactivateAudioSession = (
    e: EventsPayload['didDeactivateAudioSession'],
  ) => {
    // only in ios
    console.log('CallKeep debug: didDeactivateAudioSession')
    const cs = getCallStore()
    cs.calls
      .filter(c => c.answered && !c.holding && c.id !== cs.ongoingCallId)
      .forEach(c => c.toggleHoldWithCheck())
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
  }

  RNCallKeep.addEventListener('didLoadWithEvents', didLoadWithEvents)
  RNCallKeep.addEventListener('answerCall', answerCall)
  RNCallKeep.addEventListener('endCall', endCall)
  RNCallKeep.addEventListener('didDisplayIncomingCall', didDisplayIncomingCall)
  RNCallKeep.addEventListener(
    'didPerformSetMutedCallAction',
    didPerformSetMutedCallAction,
  )
  RNCallKeep.addEventListener(
    'didToggleHoldCallAction',
    didToggleHoldCallAction,
  )
  RNCallKeep.addEventListener('didPerformDTMFAction', didPerformDTMFAction)
  RNCallKeep.addEventListener(
    'didActivateAudioSession',
    didActivateAudioSession,
  )
  RNCallKeep.addEventListener(
    'didDeactivateAudioSession',
    didDeactivateAudioSession,
  )

  // android self-managed connection service forked version
  if (Platform.OS !== 'android') {
    return
  }

  const nav = Nav()
  // events from our custom IncomingCall module
  const eventEmitter = new NativeEventEmitter(BrekekeUtils)
  eventEmitter.addListener('answerCall', (uuid: string) => {
    getCallStore().onCallKeepAnswerCall(uuid.toUpperCase())
    RNCallKeep.setOnHold(uuid, false)
  })
  eventEmitter.addListener('rejectCall', (uuid: string) => {
    const cs = getCallStore()
    if (uuid.startsWith('CalleeClickReject-')) {
      uuid = uuid.replace('CalleeClickReject-', '').toUpperCase()
      cs.setCalleeRejected({ callkeepUuid: uuid })
    } else {
      uuid = uuid.toUpperCase()
    }
    cs.onCallKeepEndCall(uuid)
  })
  eventEmitter.addListener('transfer', async (uuid: string) => {
    await waitTimeout(100)
    nav.goToPageCallTransferChooseUser()
  })
  eventEmitter.addListener('showBackgroundCall', async (uuid: string) => {
    await waitTimeout(100)
    nav.goToPageCallBackgrounds()
  })
  eventEmitter.addListener('park', async (uuid: string) => {
    await waitTimeout(100)
    nav.goToPageCallParks2()
  })
  eventEmitter.addListener('video', (uuid: string) => {
    getCallStore().getOngoingCall()?.toggleVideo()
  })
  eventEmitter.addListener('speaker', (uuid: string) => {
    getCallStore().toggleLoudSpeaker()
  })
  eventEmitter.addListener('mute', (uuid: string) => {
    getCallStore().getOngoingCall()?.toggleMuted()
  })
  eventEmitter.addListener('record', (uuid: string) => {
    getCallStore().getOngoingCall()?.toggleRecording()
  })
  eventEmitter.addListener('dtmf', async (uuid: string) => {
    await waitTimeout(100)
    nav.goToPageCallDtmfKeypad()
  })
  eventEmitter.addListener('hold', (uuid: string) => {
    getCallStore().getOngoingCall()?.toggleHoldWithCheck()
  })
  eventEmitter.addListener('switchCamera', (uuid: string) => {
    getCallStore().getOngoingCall()?.toggleSwitchCamera()
  })

  // other utils
  eventEmitter.addListener('onBackPressed', onBackPressed)
  eventEmitter.addListener('onIncomingCallActivityBackPressed', () => {
    if (!RnStacker.stacks.length) {
      nav.goToPageIndex()
    } else {
      RnStacker.stacks = [RnStacker.stacks[0]]
    }
    getCallStore().inPageCallManage = undefined
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
  const s = getCallStore()
  if (s.inPageCallManage) {
    s.inPageCallManage = undefined
    return true
  }
  if (RnStacker.stacks.length > 1) {
    RnStacker.stacks.pop()
    return true
  }
  BrekekeUtils.backToBackground()
  return true
}
