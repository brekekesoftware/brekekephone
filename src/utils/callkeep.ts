import { AppState, NativeEventEmitter, Platform } from 'react-native'
import RNCallKeep, { Events } from 'react-native-callkeep'

import sip from '../api/sip'
import callStore from '../stores/callStore'
import intl, { intlDebug } from '../stores/intl'
import Nav from '../stores/Nav'
import RnAlert from '../stores/RnAlert'
import { BackgroundTimer } from './BackgroundTimer'
import { getCallPnData } from './PushNotification-parse'
import { IncomingCall, RnNativeModules } from './RnNativeModules'

let alreadySetupCallKeep = false

const setupCallKeepWithCheck = async () => {
  if (alreadySetupCallKeep) {
    return
  }

  // Do not re-setup ios calls
  // https://github.com/react-native-webrtc/react-native-callkeep/issues/367#issuecomment-804923269
  if (
    Platform.OS === 'ios' &&
    Object.keys(await RNCallKeep.getCalls()).length
  ) {
    return
  }

  alreadySetupCallKeep = true

  await RNCallKeep.setup({
    ios: {
      appName: 'Brekeke Phone',
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
      // Android self-managed connection service forked version
      selfManaged: true,
    },
  })
    .then(() => {
      if (Platform.OS === 'android') {
        RNCallKeep.setForegroundServiceSettings({
          channelId: 'com.brekeke.phone',
          channelName: 'Foreground service for Brekeke Phone',
          notificationTitle: 'Brekeke Phone is running on background',
          notificationIcon: 'ic_launcher',
        })
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

type TEvent = {
  callUUID: string
}
type TEventDidLoad = {
  name: string
  data: unknown
}

export const setupCallKeep = async () => {
  if (Platform.OS === 'web') {
    return
  }

  await setupCallKeepWithCheck()

  const didLoadWithEvents = (e: TEventDidLoad[]) => {
    e.forEach(e => {
      didLoadWithEventsHandlers[e.name]?.(e.data)
    })
  }
  const answerCall = (e: TEvent) => {
    // Use the custom native incoming call module for android
    if (Platform.OS === 'android') {
      return
    }
    const uuid = e.callUUID.toUpperCase()
    callStore.onCallKeepAnswerCall(uuid)
  }
  const endCall = (e: TEvent) => {
    BackgroundTimer.setTimeout(setupCallKeepWithCheck, 0)
    // Use the custom native incoming call module for android
    if (Platform.OS === 'android') {
      return
    }
    const uuid = e.callUUID.toUpperCase()
    callStore.onCallKeepEndCall(uuid)
  }
  const didDisplayIncomingCall = (
    e: TEvent & {
      handle: string
      localizedCallerName: string
      hasVideo: string // '0' | '1'
      fromPushKit: string // '0' | '1'
      payload: unknown // VOIP
      error: string // ios only
    },
  ) => {
    const uuid = e.callUUID.toUpperCase()
    // Use the custom native incoming call module for android
    if (Platform.OS === 'android') {
      return
    }
    // Try set the caller name from last known PN
    const n = getCallPnData(uuid)
    if (
      n?.from &&
      (e.localizedCallerName === 'Loading...' || e.handle === 'Loading...')
    ) {
      RNCallKeep.updateDisplay(uuid, n.from, 'Brekeke Phone')
    }
    // Call event handler in callStore
    callStore.onCallKeepDidDisplayIncomingCall(uuid)
  }
  const didPerformSetMutedCallAction = (
    e: TEvent & {
      muted: boolean
    },
  ) => {
    const uuid = e.callUUID.toUpperCase()
    const c = callStore.calls.find(c => c.callkeepUuid === uuid)
    if (c && c.muted !== e.muted) {
      c.toggleMuted(true)
    }
  }
  const didToggleHoldCallAction = (
    e: TEvent & {
      hold: boolean
    },
  ) => {
    const uuid = e.callUUID.toUpperCase()
    const c = callStore.calls.find(c => c.callkeepUuid === uuid)
    if (c && c.holding !== e.hold) {
      c.toggleHold(true)
    }
  }
  const didPerformDTMFAction = (
    e: TEvent & {
      digits: string
    },
  ) => {
    const uuid = e.callUUID.toUpperCase()
    const c = callStore.calls.find(c => c.callkeepUuid === uuid)
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
    // TODO
  }
  const didDeactivateAudioSession = () => {
    if (Platform.OS === 'android') {
      callStore.calls
        .filter(c => c.answered && !c.holding)
        .forEach(c => c.toggleHold())
    }
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
    RNCallKeep.addEventListener('showIncomingCallUi', (e: TEvent) => {
      const uuid = e.callUUID.toUpperCase()
      IncomingCall.showCall(
        uuid,
        getCallPnData(uuid)?.from || 'Loading...',
        !!callStore.calls.find(c => c.incoming && c.remoteVideoEnabled),
      )
      callStore.onCallKeepDidDisplayIncomingCall(uuid)
    })
    // Events from our custom IncomingCall module
    const eventEmitter = new NativeEventEmitter(RnNativeModules.IncomingCall)
    eventEmitter.addListener('answerCall', (uuid: string) => {
      uuid = uuid.toUpperCase()
      callStore.onCallKeepAnswerCall(uuid)
      IncomingCall.closeIncomingCallActivity(true)
      RNCallKeep.setCurrentCallActive(uuid)
      RNCallKeep.setOnHold(uuid, false)
    })
    eventEmitter.addListener('rejectCall', (uuid: string) => {
      uuid = uuid.toUpperCase()
      callStore.onCallKeepEndCall(uuid)
      IncomingCall.closeIncomingCallActivity()

      RNCallKeep.endAllCalls()
    })
    eventEmitter.addListener('endCall', (uuid: string) => {
      uuid = uuid.toUpperCase()
      callStore.onCallKeepEndCall(uuid)
      // RNCallKeep.endAllCalls()
    })
    eventEmitter.addListener('transfer', (uuid: string) => {
      setTimeout(() => {
        Nav().goToPageTransferChooseUser()
      }, 500)
    })
    eventEmitter.addListener('park', (uuid: string) => {
      setTimeout(() => {
        Nav().goToPageCallParks2()
      }, 500)
    })
    eventEmitter.addListener('video', (uuid: string) => {
      const c = callStore.currentCall
      if (c) {
        c.localVideoEnabled ? c.disableVideo() : c.enableVideo()
      }
    })
    eventEmitter.addListener('speaker', (uuid: string) => {
      callStore.toggleLoudSpeaker()
    })
    eventEmitter.addListener('mute', (uuid: string) => {
      callStore.currentCall?.toggleMuted(true)
    })
    eventEmitter.addListener('record', (uuid: string) => {
      callStore.currentCall?.toggleRecording()
    })
    eventEmitter.addListener('dtmf', (uuid: string) => {
      setTimeout(() => {
        Nav().goToPageDtmfKeypad()
      }, 500)
    })
    eventEmitter.addListener('hold', (uuid: string) => {
      callStore.currentCall?.toggleHold(true)
    })
    eventEmitter.addListener('unhold', (uuid: string) => {
      callStore.currentCall?.toggleHold(true)
    })
    // In case of answer call when phone locked
    eventEmitter.addListener('showCall', () => {
      RNCallKeep.backToForeground()
    })
  }
}
