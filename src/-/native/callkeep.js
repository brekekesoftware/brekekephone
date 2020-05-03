import { AppState, Platform } from 'react-native'
import RNCallKeep from 'react-native-callkeep'

import g from '../global'
import callStore from '../global/callStore'
import intl, { intlDebug } from '../intl/intl'

export const setupCallKeep = async () => {
  if (Platform.OS === 'web') {
    return
  }
  await RNCallKeep.setup({
    ios: {
      appName: 'Brekeke Phone',
    },
    android: {
      alertTitle: intl`Permissions required`,
      alertDescription: intl`Brekeke Phone needs to your permission to display calls`,
      cancelButton: intl`Cancel`,
      okButton: intl`OK`,
      imageName: 'phone_account_icon',
      additionalPermissions: [],
    },
  }).catch(err => {
    g.showError({
      message: intlDebug`Can not get permission to show call notification`,
      err,
    })
  })
  RNCallKeep.setAvailable(true)

  // handle (string)
  //    Phone number of the callee
  // callUUID (string)
  // name (string)
  RNCallKeep.addEventListener('didReceiveStartCallAction', e => {
    // insertCallKeepEvent(e.callUUID, {
    //   ...e,
    //   name: 'didReceiveStartCallAction',
    // })
  })

  // callUUID (string)
  RNCallKeep.addEventListener('answerCall', e => {
    // insertCallKeepEvent(e.callUUID, {
    //   ...e,
    //   name: 'answerCall',
    // })
    const c = callStore.findByUuid(e.callUUID)
    if (!c?.callkeep) {
      //
    } else {
      callStore.answerCall(c)
      RNCallKeep.setMutedCall(e.callUUID, false)
      RNCallKeep.setOnHold(e.callUUID, false)
    }
  })

  // callUUID (string)
  RNCallKeep.addEventListener('endCall', e => {
    // insertCallKeepEvent(e.callUUID, {
    //   ...e,
    //   name: 'endCall',
    // })
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
    // insertCallKeepEvent(e.callUUID, {
    //   ...e,
    //   name: 'didDisplayIncomingCall',
    // })
    // you might want to do following things when receiving this event:
    // - Start playing ringback if it is an outgoing call
  })

  // muted (boolean)
  // callUUID (string)
  RNCallKeep.addEventListener('didPerformSetMutedCallAction', e => {
    // insertCallKeepEvent(e.callUUID, {
    //   ...e,
    //   name: 'didPerformSetMutedCallAction',
    // })
    const c = callStore.findByUuid(e.callUUID)
    if (!c?.callkeep) {
      //
    } else {
      c.toggleMuted()
    }
  })

  // hold (boolean)
  // callUUID (string)
  RNCallKeep.addEventListener('didToggleHoldCallAction', e => {
    // insertCallKeepEvent(e.callUUID, {
    //   ...e,
    //   name: 'didToggleHoldCallAction',
    // })
    const c = callStore.findByUuid(e.callUUID)
    if (!c?.callkeep) {
      //
    } else {
      c.toggleHold()
    }
  })

  // digits (string)
  //    The digits that emit the dtmf tone
  // callUUID (string)
  RNCallKeep.addEventListener('didPerformDTMFAction', e => {
    // insertCallKeepEvent(e.callUUID, {
    //   ...e,
    //   name: 'didPerformDTMFAction',
    // })
    //
  })
}
