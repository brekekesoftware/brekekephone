import { action } from 'mobx'
import {
  AppState,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native'
import RNCallKeep, { Events, IOptions } from 'react-native-callkeep'

import authStore from '../stores/authStore'
import callStore, { uuidFromPN } from '../stores/callStore'
import intl, { intlDebug } from '../stores/intl'
import RnAlert from '../stores/RnAlert'
import { getLastPN } from './PushNotification-parse'

const shouldHandlePushKit = () =>
  Platform.OS === 'ios' &&
  (!callStore._calls.length || authStore.sipState !== 'success')

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
    } as IOptions['android'],
  })
    .then(() => {
      if (Platform.OS === 'android') {
        ;(RNCallKeep as any)['promptAndroidPermissions']()
      }
    })
    .catch(err => {
      if (AppState.currentState !== 'active') {
        return
      }
      RnAlert.error({
        message: intlDebug`Can not get permission to show call notification`,
        err,
      })
    })

  RNCallKeep.addEventListener(
    'didReceiveStartCallAction',
    (e: { callUUID: string; handle: string; name: string }) => {
      //
    },
  )

  RNCallKeep.addEventListener('answerCall', (e: { callUUID: string }) => {
    if (e.callUUID === uuidFromPN) {
      clearPushKitTimeout()
      if (shouldHandlePushKit()) {
        callStore.recentPNAction = 'answered'
        window.setTimeout(() => RNCallKeep.endCall(e.callUUID), 1000)
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

  RNCallKeep.addEventListener('endCall', (e: { callUUID: string }) => {
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

  RNCallKeep.addEventListener(
    'didDisplayIncomingCall',
    (e: {
      callUUID: string
      handle: string
      localizedCallerName: string
      hasVideo: string // '0' | '1'
      fromPushKit: string // '0' | '1'
      payload: unknown // VOIP
      error: string // ios only
    }) => {
      if (e.callUUID === uuidFromPN) {
        clearPushKitTimeout()
        pushKitTimeoutId = window.setTimeout(
          () => RNCallKeep.endCall(e.callUUID),
          20000,
        )
        callStore.recentPNAction = ''
        callStore.recentPNAt = Date.now()
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
    },
  )

  RNCallKeep.addEventListener(
    'didPerformSetMutedCallAction',
    (e: { callUUID: string; muted: boolean }) => {
      const c = callStore.findByUuid(e.callUUID)
      if (!c?.callkeep) {
        RNCallKeep.endCall(e.callUUID)
      } else if (e.muted !== c.muted) {
        c.toggleMuted(true)
      }
    },
  )

  RNCallKeep.addEventListener(
    'didToggleHoldCallAction',
    (e: { callUUID: string; hold: boolean }) => {
      const c = callStore.findByUuid(e.callUUID)
      if (!c?.callkeep) {
        RNCallKeep.endCall(e.callUUID)
      } else if (c.answered && e.hold !== c.holding) {
        c.toggleHold(true)
      }
    },
  )

  RNCallKeep.addEventListener(
    'didPerformDTMFAction',
    (e: { callUUID: string }) => {
      const c = callStore.findByUuid(e.callUUID)
      if (!c?.callkeep) {
        RNCallKeep.endCall(e.callUUID)
      } else {
        // TODO
      }
    },
  )

  if (Platform.OS === 'android') {
    RNCallKeep.addEventListener(
      'showIncomingCallUi' as Events,
      (e: { callUUID: string }) => {
        if (e.callUUID === uuidFromPN) {
          const n = getLastPN() as any
          NativeModules.IncomingCall.showCall(
            e.callUUID,
            n?.to || 'Loading...',
            false,
          )
          return
        }
        const c = callStore.findByUuid(e.callUUID)
        if (!c?.callkeep) {
          RNCallKeep.endCall(e.callUUID)
          return
        }
        NativeModules.IncomingCall.showCall(
          c.uuid,
          c.title,
          c.remoteVideoEnabled,
        )
      },
    )

    const eventEmitter = new NativeEventEmitter(NativeModules.IncomingCall)
    eventEmitter.addListener('answerCall', (uuid: string) => {
      if (uuid === uuidFromPN) {
        RNCallKeep.backToForeground()
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
      RNCallKeep.backToForeground()
    })
    eventEmitter.addListener('rejectCall', (uuid: string) => {
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
