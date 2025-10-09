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
const IncomingItemIos = () =>
  // it should not handle anything on iOS. Because
  // RNCallKeep already handles ringtone when PN is disabled
  // if we handle it here, it will conflict with AudioSession
  null

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
  }
  useEffect(() => {
    BrekekeUtils.playRBT(p.isLoudSpeaker)
  }, [p.isLoudSpeaker])
  useEffect(
    () => () => {
      stopRingbackAndSyncSpeaker()
    },
    [],
  )
  return null
}
