import { Platform } from 'react-native'
import RNCallKeep from 'react-native-callkeep'

import intl from '../intl/intl'

const setup = async () => {
  if (Platform.OS !== 'web') {
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
    // TODO
  })
  RNCallKeep.setAvailable(true)
}

setTimeout(setup, 1000)

// handle (string)
//    Phone number of the callee
// callUUID (string)
// name (string)
RNCallKeep.addEventListener('didReceiveStartCallAction', e => {
  //
})

// callUUID (string)
RNCallKeep.addEventListener('answerCall', e => {
  // Do your normal `Answering` actions here
})

// callUUID (string)
RNCallKeep.addEventListener('endCall', e => {
  // Do your normal `Hang Up` actions here
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
  // you might want to do following things when receiving this event:
  // - Start playing ringback if it is an outgoing call
})

// muted (boolean)
// callUUID (string)
RNCallKeep.addEventListener('didPerformSetMutedCallAction', e => {
  //
})

// hold (boolean)
// callUUID (string)
RNCallKeep.addEventListener('didToggleHoldCallAction', e => {
  //
})

// digits (string)
//    The digits that emit the dtmf tone
// callUUID (string)
RNCallKeep.addEventListener('didPerformDTMFAction', e => {
  //
})

export default null // TODO
