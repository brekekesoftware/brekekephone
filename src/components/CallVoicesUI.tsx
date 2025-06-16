import { Component, useEffect } from 'react'
import IncallManager from 'react-native-incall-manager'

import { sip } from '../api/sip'
import { isAndroid } from '../config'
import { getCallStore } from '../stores/callStore'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { waitTimeout } from '../utils/waitTimeout'

export class IncomingItem extends Component {
  componentDidMount = () => {
    if (isAndroid) {
      BrekekeUtils.startRingtone()
    } else {
      // old logic: only play ringtone without vibration and repeat the ringtone continuously
      IncallManager.startRingtone('_BUNDLE_', [], 'default', 0)
    }
  }
  componentWillUnmount = () => {
    if (isAndroid) {
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
    if (isAndroid) {
      IncallManager.startRingback('_BUNDLE_')
    }
  }
  componentWillUnmount = () => {
    if (isAndroid) {
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
  componentDidMount = () => {
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
    // make sure AVAudioSession deactivated
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
