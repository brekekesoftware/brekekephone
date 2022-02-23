import { AppState, Keyboard, NativeEventEmitter, Platform } from 'react-native'
import RNCallKeep, { Events } from 'react-native-callkeep'

import { sip } from '../api/sip'
import { callStore } from '../stores/callStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { RnKeyboard } from '../stores/RnKeyboard'
import { RnPicker } from '../stores/RnPicker'
import { RnStacker } from '../stores/RnStacker'
import { BackgroundTimer } from './BackgroundTimer'
import { parseNotificationData } from './PushNotification-parse'
import { BrekekeUtils } from './RnNativeModules'

let alreadySetupCallKeep = false

const setupCallKeepWithCheck = async () => {
  if (alreadySetupCallKeep) {
    return
  }

  // Do not re-setup ios calls
  // https://github.com/react-native-webrtc/react-native-callkeep/issues/367#issuecomment-804923269
  if (
    Platform.OS === 'ios' &&
    (Object.keys(await RNCallKeep.getCalls()).length ||
      Object.keys(callStore.callkeepMap).length ||
      AppState.currentState !== 'active')
  ) {
    return
  }

  alreadySetupCallKeep = true

  await RNCallKeep.setup({
    ios: {
      appName: 'Brekeke Phone',
      // Already put this on our fork to display our logo before js load
      imageName: 'callkit.png',
      // https://github.com/react-native-webrtc/react-native-callkeep/issues/193
      // https://github.com/react-native-webrtc/react-native-callkeep/issues/181
      supportsVideo: false,
    },
    android: {
      alertTitle: intl`Permissions required`,
      alertDescription: intl`Brekeke Phone needs to your permission to display calls`,
      cancelButton: intl`Cancel`,
      okButton: intl`OK`,
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
  })
    .then(() => {
      if (Platform.OS === 'android') {
        RNCallKeep.registerPhoneAccount()
        RNCallKeep.registerAndroidEvents()
        RNCallKeep.setAvailable(true)
        RNCallKeep.canMakeMultipleCalls(true)
      }
    })
    .catch((err: Error) => {
      if (AppState.currentState !== 'active') {
        console.error(err)
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

  const didLoadWithEvents = (e: TEventDidLoad[]) => {
    e.forEach(_ => {
      didLoadWithEventsHandlers[_.name]?.(_.data)
    })
  }
  const answerCall = (e: TEvent) => {
    const uuid = e.callUUID.toUpperCase()
    Platform.OS === 'android'
      ? // Handle action from CallKeep Notification on android
        BrekekeUtils.onCallKeepAction(uuid, 'answerCall')
      : callStore.onCallKeepAnswerCall(uuid)
  }
  const endCall = (e: TEvent) => {
    BackgroundTimer.setTimeout(setupCallKeepWithCheck, 0)
    const uuid = e.callUUID.toUpperCase()
    Platform.OS === 'android'
      ? // Handle action from CallKeep Notification on android
        BrekekeUtils.onCallKeepAction(uuid, 'rejectCall')
      : callStore.onCallKeepEndCall(uuid, true)
  }
  const didDisplayIncomingCall = (
    e: TEvent & {
      handle: string
      localizedCallerName: string
      hasVideo: string // '0' | '1'
      fromPushKit: string // '0' | '1'
      payload: object // VOIP
      error: string // ios only
    },
  ) => {
    const uuid = e.callUUID.toUpperCase()
    // Use the custom native incoming call module for android
    if (Platform.OS === 'android') {
      return
    }
    const n = parseNotificationData(e.payload)
    console.error(
      `SIP PN debug: callkeep.didDisplayIncomingCall has e.payload: ${!!e.payload} found pnData: ${!!n}`,
    )
    if (n) {
      callStore.onCallKeepDidDisplayIncomingCall(uuid, n)
    } else {
      console.error('SIP PN debug: call RNCallKeep.endCall: pnData not found')
      RNCallKeep.endCall(uuid)
    }
  }
  const didPerformSetMutedCallAction = (
    e: TEvent & {
      muted: boolean
    },
  ) => {
    const uuid = e.callUUID.toUpperCase()
    const c = callStore.calls.find(_ => _.callkeepUuid === uuid)
    if (c && c.muted !== e.muted) {
      c.toggleMuted()
    }
  }
  const didToggleHoldCallAction = (
    e: TEvent & {
      hold: boolean
    },
  ) => {
    const uuid = e.callUUID.toUpperCase()
    const c = callStore.calls.find(_ => _.callkeepUuid === uuid)
    if (c && c.holding !== e.hold) {
      c.toggleHoldWithCheck()
    }
  }
  const didPerformDTMFAction = (
    e: TEvent & {
      digits: string
    },
  ) => {
    const uuid = e.callUUID.toUpperCase()
    const c = callStore.calls.find(_ => _.callkeepUuid === uuid)
    if (c) {
      sip.sendDTMF({
        sessionId: c.id,
        signal: e.digits.charAt(e.digits.length - 1),
        talkerId: c.pbxTalkerId,
        tenant: c.pbxTenant,
      })
    }
  }
  const didActivateAudioSession = () => {
    // Only in ios
    console.error('CallKeep debug: didActivateAudioSession')
  }
  const didDeactivateAudioSession = () => {
    // Only in ios
    console.error('CallKeep debug: didDeactivateAudioSession')
    callStore.calls
      .filter(c => c.answered && !c.holding)
      .forEach(c => c.toggleHoldWithCheck())
  }

  // https://github.com/react-native-webrtc/react-native-callkeep#--didloadwithevents
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

  Object.entries({
    didLoadWithEvents,
    answerCall,
    endCall,
    didDisplayIncomingCall,
    didPerformSetMutedCallAction,
    didToggleHoldCallAction,
    didPerformDTMFAction,
    didActivateAudioSession,
    didDeactivateAudioSession,
  }).forEach(([k, v]) => {
    RNCallKeep.addEventListener(k as Events, v)
  })

  // Android self-managed connection service forked version
  if (Platform.OS === 'android') {
    // Events from our custom IncomingCall module
    const eventEmitter = new NativeEventEmitter(BrekekeUtils)
    eventEmitter.addListener('answerCall', (uuid: string) => {
      callStore.onCallKeepAnswerCall(uuid.toUpperCase())
      RNCallKeep.setOnHold(uuid, false)
    })
    eventEmitter.addListener('rejectCall', (uuid: string) => {
      let callUUID = uuid
      const isCalleeClickReject = uuid.startsWith('CalleeClickReject')
      if (isCalleeClickReject) {
        callUUID = uuid.replace('CalleeClickReject-', '')
      }
      callStore.onCallKeepEndCall(callUUID.toUpperCase(), isCalleeClickReject)
    })
    eventEmitter.addListener('transfer', (uuid: string) => {
      BackgroundTimer.setTimeout(Nav().goToPageCallTransferChooseUser, 300)
    })
    eventEmitter.addListener('park', (uuid: string) => {
      BackgroundTimer.setTimeout(Nav().goToPageCallParks2, 300)
    })
    eventEmitter.addListener('video', (uuid: string) => {
      callStore.getCurrentCall()?.toggleVideo()
    })
    eventEmitter.addListener('speaker', (uuid: string) => {
      callStore.toggleLoudSpeaker()
    })
    eventEmitter.addListener('mute', (uuid: string) => {
      callStore.getCurrentCall()?.toggleMuted()
    })
    eventEmitter.addListener('record', (uuid: string) => {
      callStore.getCurrentCall()?.toggleRecording()
    })
    eventEmitter.addListener('dtmf', (uuid: string) => {
      BackgroundTimer.setTimeout(Nav().goToPageCallDtmfKeypad, 300)
    })
    eventEmitter.addListener('hold', (uuid: string) => {
      callStore.getCurrentCall()?.toggleHoldWithCheck()
    })
    // In case of answer call when phone locked
    eventEmitter.addListener('backToForeground', () => {
      console.error('SIP PN debug: backToForeground')
      BackgroundTimer.setTimeout(RNCallKeep.backToForeground, 100)
      BackgroundTimer.setTimeout(BrekekeUtils.closeAllIncomingCalls, 300)
    })
    // Other utils
    eventEmitter.addListener('onBackPressed', onBackPressed)
    eventEmitter.addListener('debug', (m: string) =>
      console.error(`Android debug: ${m}`),
    )
  }
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
  if (RnStacker.stacks.length > 1) {
    RnStacker.stacks.pop()
    return true
  }
  BrekekeUtils.backToBackground()
  return true
}
