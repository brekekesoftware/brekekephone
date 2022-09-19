import { observer } from 'mobx-react'
import { Platform } from 'react-native'

import { callStore } from '../stores/callStore'
import {
  AnsweredItem,
  OutgoingItem,
  OutgoingItemWithSDP,
  VideoRBT,
} from './CallVoicesUI'

export const CallVoices = observer(() => {
  // Try trigger observer?
  void Object.keys(callStore.callkeepMap)
  void callStore.calls.map(_ => _.callkeepUuid)

  const currentCall = callStore.getCurrentCall()
  const isOutgoingCallStart =
    currentCall &&
    !currentCall.incoming &&
    !currentCall.answered &&
    currentCall.sessionStatus === 'progress'

  const outgoingWithSDP = currentCall && currentCall?.withSDP

  const isPaused = !(isOutgoingCallStart && !outgoingWithSDP)

  return (
    <>
      {isOutgoingCallStart &&
        (outgoingWithSDP ? (
          <OutgoingItemWithSDP earlyMedia={currentCall.earlyMedia} />
        ) : (
          <OutgoingItem />
        ))}
      {
        // load RBT first
        Platform.OS === 'ios' && isOutgoingCallStart && (
          <VideoRBT
            isPaused={isPaused}
            isLoudSpeaker={callStore.isLoudSpeakerEnabled}
          />
        )
      }
      {callStore.calls
        .filter(c => c.answered)
        .map(c => (
          <AnsweredItem key={c.id} voiceStreamObject={c.voiceStreamObject} />
        ))}
    </>
  )
})
