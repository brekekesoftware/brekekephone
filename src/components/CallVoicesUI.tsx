import { observer } from 'mobx-react'
import { Component, useEffect, useRef } from 'react'
import IncallManager from 'react-native-incall-manager'

import { isAndroid } from '#/config'
import { ctx } from '#/stores/ctx'
import { BrekekeUtils } from '#/utils/BrekekeUtils'
import { waitTimeout } from '#/utils/waitTimeout'

const IncomingItemAndroid = observer(() => {
  const ca = ctx.auth.getCurrentAccount()
  const c = ctx.call.getCallInNotify()
  const r = useRef<Promise<boolean>>(undefined)
  useEffect(() => {
    if (!ca || !c) {
      return
    }
    const pending = r.current
    r.current = (async () => {
      await pending
      await waitTimeout()
      return BrekekeUtils.startRingtone(
        c.ringtoneFromSip,
        ca.pbxUsername,
        ca.pbxTenant,
        ca.pbxHostname,
        ca.pbxPort,
      )
    })()
  }, [ca, c])
  useEffect(
    () => () => {
      const pending = r.current
      r.current = (async () => {
        await pending
        return BrekekeUtils.stopRingtone()
      })()
    },
    [],
  )
  return null
})
const IncomingItemIos = () => {
  useEffect(() => {
    // old logic: only play ringtone without vibration and repeat the ringtone continuously
    IncallManager.startRingtone('_BUNDLE_', [], 'default', 0)
    return () => IncallManager.stopRingtone()
  }, [])
  return null
}
// IncomingItem will mount when PN is disabled
export const IncomingItem = isAndroid ? IncomingItemAndroid : IncomingItemIos

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
