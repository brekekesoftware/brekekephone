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
  // try trigger observer?
  void Object.keys(getCallStore().callkeepMap)
  void getCallStore().calls.map(_ => _.callkeepUuid)
  const oc = getCallStore().getOngoingCall()
  const isOutgoingCallStart =
    oc && !oc.incoming && !oc.answered && oc.sessionStatus === 'progress'

  // When you receive a 18x response (usually 180 or 183) with SDP,
  // you don't play the local RBT file (ring back tone) and you play the audio data in the RTP packets.
  const statusCode = oc?.rawSession?.incomingMessage?.status_code
  const playEarlyMedia =
    statusCode && /^18[0-9]$/.test(statusCode.toString()) && oc?.withSDP

  return (
    <>
      {isOutgoingCallStart &&
        (playEarlyMedia ? (
          <OutgoingItemWithSDP earlyMedia={oc.earlyMedia} />
        ) : (
          <OutgoingItem />
        ))}
      {
        // play the local RBT for ios only
        Platform.OS === 'ios' && isOutgoingCallStart && !playEarlyMedia && (
          <VideoRBT
            isPlay={!playEarlyMedia}
            isLoudSpeaker={getCallStore().isLoudSpeakerEnabled}
          />
        )
      }
      {getCallStore()
        .calls.filter(c => c.answered)
        .map(c => (
          <AnsweredItem key={c.id} voiceStreamObject={c.voiceStreamObject} />
        ))}
    </>
  )
})
