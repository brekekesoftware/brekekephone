import { isAndroid } from '@rntwsc/rn/core/utils/platform'
import { observer } from 'mobx-react'
import { useEffect, useRef } from 'react'
import IncallManager from 'react-native-incall-manager'

import { ctx } from '#/stores/ctx'
import { BrekekeUtils } from '#/utils/brekeke-utils'
import { waitTimeout } from '#/utils/wait-timeout'

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

export const OutgoingItem = () => {
  useEffect(() => {
    if (ctx.call.ongoingCallId) {
      ctx.sip.disableMedia(ctx.call.ongoingCallId)
    }
    if (isAndroid) {
      IncallManager.startRingback('_BUNDLE_')
    }
    return () => {
      if (isAndroid) {
        IncallManager.stopRingback()
      }
    }
  }, [])
  return null
}

export const OutgoingItemWithSDP = ({
  earlyMedia,
}: {
  earlyMedia: MediaStream | null
}) => {
  useEffect(() => {
    if (ctx.call.ongoingCallId) {
      ctx.sip.enableMedia(ctx.call.ongoingCallId)
    }
  }, [])
  return null
}

export const AnsweredItem = ({
  voiceStreamObject,
}: {
  voiceStreamObject: MediaStream | null
}) => {
  useEffect(() => {
    const oc = ctx.call.getOngoingCall()
    if (oc) {
      ctx.sip.enableMedia(oc.id)
    }
  }, [])
  return null
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
