import { observer } from 'mobx-react'
import { Platform } from 'react-native'

import { getCallStore } from '../stores/callStore'
import {
  AnsweredItem,
  OutgoingItem,
  OutgoingItemWithSDP,
  VideoRBT,
} from './CallVoicesUI'

export const CallVoices = observer(() => {
  const cs = getCallStore()
  // try trigger observer?
  void Object.keys(cs.callkeepMap)
  void cs.calls.map(_ => _.callkeepUuid)

  const oc = cs.getOngoingCall()
  const isOutgoingProgress =
    oc && !oc.incoming && !oc.answered && oc.sessionStatus === 'progress'

  // when receive a 18x response (usually 180 or 183) with SDP
  // don't play the local RBT, but the audio data in the RTP packets
  const code = oc?.rawSession?.incomingMessage?.status_code
  const playEarlyMedia =
    code && /^18[0-9]$/.test(code.toString()) && oc?.withSDP

  return (
    <>
      {isOutgoingProgress &&
        (playEarlyMedia ? (
          <OutgoingItemWithSDP earlyMedia={oc.earlyMedia} />
        ) : (
          <>
            <OutgoingItem />
            {Platform.OS === 'ios' && (
              <VideoRBT isPlay isLoudSpeaker={cs.isLoudSpeakerEnabled} />
            )}
          </>
        ))}
      {cs.calls
        .filter(c => c.answered)
        .map(c => (
          <AnsweredItem key={c.id} voiceStreamObject={c.voiceStreamObject} />
        ))}
    </>
  )
})
