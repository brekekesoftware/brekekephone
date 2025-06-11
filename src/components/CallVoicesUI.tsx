import { Component, useEffect } from 'react'
import { Platform } from 'react-native'
import IncallManager from 'react-native-incall-manager'

import { sip } from '../api/sip'
import { getCallStore } from '../stores/callStore'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { waitTimeout } from '../utils/waitTimeout'

export class IncomingItem extends Component {
  componentDidMount = () => {
    if (Platform.OS === 'android') {
      BrekekeUtils.startRingtone()
    } else {
      // Old logic: only play ringtone without vibration and repeat the ringtone continuously
      IncallManager.startRingtone('_BUNDLE_', [], 'default', 0)
    }
  }
  componentWillUnmount = () => {
    if (Platform.OS === 'android') {
      BrekekeUtils.stopRingtone()
    } else {
      IncallManager.stopRingtone()
    }
  }
  render() {
    return null
  }
}

export class OutgoingItem extends Component {
  componentDidMount = () => {
    const { ongoingCallId } = getCallStore()
    if (ongoingCallId) {
      sip.disableMedia(ongoingCallId)
    }
    if (Platform.OS === 'android') {
      IncallManager.startRingback('_BUNDLE_')
    }
  }
  componentWillUnmount = () => {
    if (Platform.OS === 'android') {
      IncallManager.stopRingback()
    }
  }
  render() {
    return null
  }
}
export class OutgoingItemWithSDP extends Component<{
  earlyMedia: MediaStream | null
}> {
  componentDidMount = () => {
    const { ongoingCallId } = getCallStore()
    if (ongoingCallId) {
      sip.enableMedia(ongoingCallId)
    }
  }
  render() {
    return null
  }
}
export class AnsweredItem extends Component<{
  voiceStreamObject: MediaStream | null
}> {
  componentDidMount = async () => {
    const oc = getCallStore().getOngoingCall()
    if (oc) {
      sip.enableMedia(oc.id)
    }
  }
  render() {
    return null
  }
}

export const IosRBT = (p: { isLoudSpeaker: boolean }) => {
  const stopRingbackAndSyncSpeaker = async () => {
    await BrekekeUtils.stopRBT()
    // Make sure AVAudioSession deactivated
    await waitTimeout()
    IncallManager.setForceSpeakerphoneOn(p.isLoudSpeaker)
  }
  useEffect(() => {
    BrekekeUtils.playRBT(p.isLoudSpeaker)
    return () => {
      stopRingbackAndSyncSpeaker()
    }
  }, [p.isLoudSpeaker])
  return null
}
