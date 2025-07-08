import { Component, useEffect } from 'react'
import IncallManager from 'react-native-incall-manager'

import { isAndroid } from '#/config'
import { ctx } from '#/stores/ctx'
import { BrekekeUtils } from '#/utils/RnNativeModules'
import { waitTimeout } from '#/utils/waitTimeout'

/*
  IncomingItem will mount when PN is disabled
*/
export class IncomingItem extends Component {
  componentDidMount = () => {
    const a = ctx.auth.getCurrentAccount()
    if (isAndroid && a) {
      BrekekeUtils.startRingtone(
        a.pbxUsername,
        a.pbxTenant,
        a.pbxHostname,
        a.pbxPort,
      )
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
    if (ctx.call.ongoingCallId) {
      ctx.sip.disableMedia(ctx.call.ongoingCallId)
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
    if (ctx.call.ongoingCallId) {
      ctx.sip.enableMedia(ctx.call.ongoingCallId)
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
    const oc = ctx.call.getOngoingCall()
    if (oc) {
      ctx.sip.enableMedia(oc.id)
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
