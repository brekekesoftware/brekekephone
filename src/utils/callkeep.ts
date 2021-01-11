import { AppState, NativeEventEmitter, Platform } from 'react-native'
import RNCallKeep from 'react-native-callkeep'

import sip from '../api/sip'
import callStore from '../stores/callStore'
import intl, { intlDebug } from '../stores/intl'
import RnAlert from '../stores/RnAlert'
import { getLastCallPn } from './PushNotification-parse'
import { RnNativeModules } from './RnNativeModules'

export const setupCallKeep = async () => {
  if (Platform.OS === 'web') {
    return
  }

  if (Platform.OS === 'android') {
    RNCallKeep.setAvailable(true)
    RNCallKeep.setForegroundServiceSettings({
      channelId: 'com.brekeke.phone',
      channelName: 'Foreground service for Brekeke Phone',
      notificationTitle: 'Brekeke Phone is running on background',
      notificationIcon: 'ic_launcher',
    })
    RNCallKeep.canMakeMultipleCalls(false)
  }

  await RNCallKeep.setup({
    ios: {
      appName: 'Brekeke Phone',
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
      allowSelfManaged: true,
    },
  })
    .then(() => {
      if (Platform.OS === 'android') {
        // Android self-managed connection service forked version
        return RNCallKeep.promptAndroidPermissions()
      }
    })
    .catch((err: Error) => {
      if (AppState.currentState !== 'active') {
        return
      }
      RnAlert.error({
        message: intlDebug`Can not get permission to show call notification`,
        err,
      })
    })

  const onDidLoadWithEvents = (e: { name: string; data: unknown }[]) => {
    e.forEach(e => {
      handlers[e.name.replace('RNCallKeep', 'on')]?.(e.data)
    })
  }
  const onAnswerCallAction = (e: { callUUID: string }) => {
    if (Platform.OS === 'android') {
      // Use the custom native incoming call module for android
      return
    }
    const uuid = e.callUUID.toLowerCase()
    callStore.onCallKeepAnswerCall(uuid)
  }
  const onEndCallAction = (e: { callUUID: string }) => {
    if (Platform.OS === 'android') {
      // Use the custom native incoming call module for android
      return
    }
    const uuid = e.callUUID.toLowerCase()
    callStore.onCallKeepEndCall(uuid)
  }
  const onDidDisplayIncomingCall = (e: {
    callUUID: string
    handle: string
    localizedCallerName: string
    hasVideo: string // '0' | '1'
    fromPushKit: string // '0' | '1'
    payload: unknown // VOIP
    error: string // ios only
  }) => {
    const uuid = e.callUUID.toLowerCase()
    // Try set the caller name from last known PN
    const n = getLastCallPn()
    if (
      n?.from &&
      e.localizedCallerName === 'Loading...' &&
      e.handle === 'Loading'
    ) {
      RNCallKeep.updateDisplay(uuid, n.from, 'Brekeke Phone')
    }
    // Call event handler in callStore
    callStore.onCallKeepDidDisplayIncomingCall(uuid)
  }
  const onDidPerformSetMutedCallAction = (e: {
    callUUID: string
    muted: boolean
  }) => {
    if (Platform.OS === 'android') {
      // Use the custom native incoming call module for android
      return
    }
    const uuid = e.callUUID.toLowerCase()
    const c = callStore.calls.find(c => c.callkeepUuid === uuid)
    if (c && c.muted !== e.muted) {
      c.toggleMuted(true)
    }
  }
  const onDidToggleHoldCallAction = (e: {
    callUUID: string
    hold: boolean
  }) => {
    if (Platform.OS === 'android') {
      // Use the custom native incoming call module for android
      return
    }
    const uuid = e.callUUID.toLowerCase()
    const c = callStore.calls.find(c => c.callkeepUuid === uuid)
    if (c && c.holding !== e.hold) {
      c.toggleHold(true)
    }
  }
  const onDidPerformDTMFAction = (e: { callUUID: string; digits: string }) => {
    if (Platform.OS === 'android') {
      // Use the custom native incoming call module for android
      return
    }
    const uuid = e.callUUID.toLowerCase()
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
  const onShowIncomingCallUi = (e: { callUUID: string }) => {
    const uuid = e.callUUID.toLowerCase()
    RnNativeModules.IncomingCall.showCall(
      uuid,
      getLastCallPn()?.from || 'Loading...',
      !!callStore.calls.find(c => c.incoming && c.remoteVideoEnabled),
    )
  }
  const handlers: { [k: string]: Function } = {
    onAnswerCallAction,
    onEndCallAction,
    onDidDisplayIncomingCall,
    onDidPerformSetMutedCallAction,
    onDidToggleHoldCallAction,
    onDidPerformDTMFAction,
    onShowIncomingCallUi,
  }

  RNCallKeep.addEventListener('didLoadWithEvents', onDidLoadWithEvents)
  RNCallKeep.addEventListener('answerCall', onAnswerCallAction)
  RNCallKeep.addEventListener('endCall', onEndCallAction)
  RNCallKeep.addEventListener(
    'didDisplayIncomingCall',
    onDidDisplayIncomingCall,
  )
  RNCallKeep.addEventListener(
    'didPerformSetMutedCallAction',
    onDidPerformSetMutedCallAction,
  )
  RNCallKeep.addEventListener(
    'didToggleHoldCallAction',
    onDidToggleHoldCallAction,
  )
  RNCallKeep.addEventListener('didPerformDTMFAction', onDidPerformDTMFAction)

  // Android self-managed connection service forked version
  if (Platform.OS === 'android') {
    RNCallKeep.addEventListener('showIncomingCallUi', onShowIncomingCallUi)
    const eventEmitter = new NativeEventEmitter(RnNativeModules.IncomingCall)
    eventEmitter.addListener('answerCall', (uuid: string) => {
      uuid = uuid.toLowerCase()
      callStore.onCallKeepAnswerCall(uuid)
      RnNativeModules.IncomingCall.closeIncomingCallActivity()
      RNCallKeep.backToForeground()
    })
    eventEmitter.addListener('rejectCall', (uuid: string) => {
      uuid = uuid.toLowerCase()
      callStore.onCallKeepEndCall(uuid)
      RnNativeModules.IncomingCall.closeIncomingCallActivity()
    })
  }
}
