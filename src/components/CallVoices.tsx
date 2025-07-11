import { observer } from 'mobx-react'

import {
  AnsweredItem,
  IosRBT,
  OutgoingItem,
  OutgoingItemWithSDP,
} from '#/components/CallVoicesUI'
import { isIos } from '#/config'
import { ctx } from '#/stores/ctx'

export const CallVoices = observer(() => {
  // try trigger observer?
  void Object.keys(ctx.call.callkeepMap)
  void ctx.call.calls.map(_ => _.callkeepUuid)

  const oc = ctx.call.getOngoingCall()
  const isOutgoing = oc && !oc.incoming && !oc.answered
  const isOutgoingProgress = isOutgoing && oc.sessionStatus === 'progress'

  // when receive a 18x response (usually 180 or 183) with SDP
  // don't play the local RBT, but the audio data in the RTP packets
  const code = oc?.rawSession?.incomingMessage?.status_code
  const playEarlyMedia = code && /^18[0-9]$/.test(code.toString()) && oc.withSDP

  return (
    <>
      {isOutgoing &&
        (isOutgoingProgress && playEarlyMedia && oc.earlyMedia ? (
          <OutgoingItemWithSDP earlyMedia={oc.earlyMedia} />
        ) : (
          <>
            <OutgoingItem />
            {isIos && <IosRBT isLoudSpeaker={ctx.call.isLoudSpeakerEnabled} />}
          </>
        ))}
      {ctx.call.calls
        .filter(c => c.answered)
        .map(c => (
          <AnsweredItem key={c.id} voiceStreamObject={c.voiceStreamObject} />
        ))}
    </>
  )
})
