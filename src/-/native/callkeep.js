import { action } from 'mobx'
import {
  AppState,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native'
import RNCallKeep from 'react-native-callkeep'

import g from '../global'
import authStore from '../global/authStore'
import callStore, { uuidFromPN } from '../global/callStore'
import intl, { intlDebug } from '../intl/intl'

const shouldHandlePushKit = () =>
  !callStore._calls.length || authStore.sipState !== 'success'

let pushKitTimeoutId = 0
const clearPushKitTimeout = () => {
  if (pushKitTimeoutId) {
    clearTimeout(pushKitTimeoutId)
    pushKitTimeoutId = 0
  }
}

export const setupCallKeep = async () => {
  if (Platform.OS === 'web') {
    return
  }

  RNCallKeep.setAvailable(true)

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
      allowSelfManaged: true,
    },
  })
    .then(() => {
      if (Platform.OS === 'android') {
        RNCallKeep.promptAndroidPermissions()
      }
    })
    .catch(err => {
      if (AppState.currentState !== 'active') {
        return
      }
      g.showError({
        message: intlDebug`Can not get permission to show call notification`,
        err,
      })
    })

  // handle (string)
  //    Phone number of the callee
  // callUUID (string)
  // name (string)
  RNCallKeep.addEventListener('didReceiveStartCallAction', e => {
    //
  })

  // callUUID (string)
  RNCallKeep.addEventListener('answerCall', e => {
    if (e.callUUID === uuidFromPN) {
      clearPushKitTimeout()
      if (shouldHandlePushKit()) {
        callStore.recentPNAction = 'answered'
        setTimeout(() => RNCallKeep.endCall(e.callUUID), 1000)
        return
      }
    }
    const c = callStore.findByUuid(e.callUUID)
    if (!c?.callkeep) {
      RNCallKeep.endCall(e.callUUID)
    } else {
      callStore.answerCall(c, {
        // https://github.com/react-native-webrtc/react-native-callkeep/issues/193
        // https://github.com/react-native-webrtc/react-native-callkeep/issues/181
        // videoEnabled: false,
      })
      RNCallKeep.setMutedCall(e.callUUID, false)
      RNCallKeep.setOnHold(e.callUUID, false)
    }
  })

  // callUUID (string)
  RNCallKeep.addEventListener('endCall', e => {
    if (e.callUUID === uuidFromPN) {
      clearPushKitTimeout()
      if (shouldHandlePushKit() && !callStore.recentPNAction) {
        callStore.recentPNAction = 'rejected'
        return
      }
    }
    const c = callStore.findByUuid(e.callUUID)
    if (!c?.callkeep) {
      //
    } else {
      c.hangupWithUnhold()
    }
  })

  RNCallKeep.addEventListener('didActivateAudioSession', () => {
    // you might want to do following things when receiving this event:
    // - Start playing ringback if it is an outgoing call
  })

  // error (string)
  //    iOS only.
  // callUUID (string)
  //    The UUID of the call.
  // handle (string)
  //    Phone number of the caller
  // localizedCallerName (string)
  //    Name of the caller to be displayed on the native UI
  // hasVideo (string)
  //    1 (video enabled)
  //    0 (video not enabled)
  // fromPushKit (string)
  //    1 (call triggered from PushKit)
  //    0 (call not triggered from PushKit)
  // payload (object)
  //    VOIP push payload.
  RNCallKeep.addEventListener('didDisplayIncomingCall', e => {
    if (e.callUUID === uuidFromPN) {
      clearPushKitTimeout()
      pushKitTimeoutId = setTimeout(() => RNCallKeep.endCall(e.callUUID), 20000)
      callStore.recentPNAction = ''
      callStore.recentPNActionAt = Date.now()
      if (shouldHandlePushKit()) {
        return
      }
    }
    const c = callStore.findByUuid(e.callUUID)
    if (!c?.callkeep) {
      RNCallKeep.endCall(e.callUUID)
    } else {
      c.callkeepDisplayed = true
    }
  })

  // muted (boolean)
  // callUUID (string)
  RNCallKeep.addEventListener('didPerformSetMutedCallAction', e => {
    const c = callStore.findByUuid(e.callUUID)
    if (!c?.callkeep) {
      RNCallKeep.endCall(e.callUUID)
    } else if (e.muted !== c.muted) {
      c.toggleMuted(true)
    }
  })

  // hold (boolean)
  // callUUID (string)
  RNCallKeep.addEventListener('didToggleHoldCallAction', e => {
    const c = callStore.findByUuid(e.callUUID)
    if (!c?.callkeep) {
      RNCallKeep.endCall(e.callUUID)
    } else if (c.answered && e.hold !== c.holding) {
      c.toggleHold(true)
    }
  })

  // digits (string)
  //    The digits that emit the dtmf tone
  // callUUID (string)
  RNCallKeep.addEventListener('didPerformDTMFAction', e => {
    const c = callStore.findByUuid(e.callUUID)
    if (!c?.callkeep) {
      RNCallKeep.endCall(e.callUUID)
    } else {
      // TODO
    }
  })

  if (Platform.OS === 'android') {
    RNCallKeep.addEventListener('showIncomingCallUi', e => {
      const c = callStore.findByUuid(e.callUUID)
      if (!c?.callkeep) {
        RNCallKeep.endCall(e.callUUID)
        return
      }
      NativeModules.IncomingCall.showCall(c.uuid, c.title, c.remoteVideoEnabled)
    })

    const eventEmitter = new NativeEventEmitter(NativeModules.IncomingCall)
    eventEmitter.addListener('answerCall', uuid => {
      if (uuid === uuidFromPN) {
        callStore.recentPNAction = 'answered'
        return
      }
      const c = callStore.findByUuid(uuid)
      if (!c?.callkeep) {
        RNCallKeep.endCall(uuid)
        return
      }
      callStore.answerCall(c)
      NativeModules.IncomingCall.closeIncomingCallActivity()
      setTimeout(() => RNCallKeep.backToForeground())
    })
    eventEmitter.addListener('rejectCall', uuid => {
      if (uuid === uuidFromPN) {
        callStore.recentPNAction = 'rejected'
        return
      }
      const c = callStore.findByUuid(uuid)
      if (!c?.callkeep) {
        RNCallKeep.endCall(uuid)
        return
      }
      c.hangup()
    })
    eventEmitter.addListener(
      'startRingtone',
      action(() => {
        callStore.androidRingtone++
      }),
    )
    eventEmitter.addListener(
      'stopRingtone',
      action(() => {
        callStore.androidRingtone--
      }),
    )
  }
}
