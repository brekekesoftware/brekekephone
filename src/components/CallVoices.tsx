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
  // Try trigger observer?
  void Object.keys(getCallStore().callkeepMap)
  void getCallStore().calls.map(_ => _.callkeepUuid)
  const currentCall = getCallStore().getCurrentCall()
  const isOutgoingCallStart =
    currentCall &&
    !currentCall.incoming &&
    !currentCall.answered &&
    (currentCall.sessionStatus === 'progress' ||
      currentCall.sessionStatus === 'dialing')
  return (
    <>
      {isOutgoingCallStart &&
        (currentCall?.withSDP ? (
          <OutgoingItemWithSDP earlyMedia={currentCall.earlyMedia} />
        ) : (
          <OutgoingItem />
        ))}
      {Platform.OS === 'ios' && isOutgoingCallStart && (
        <VideoRBT
          withSDP={!!currentCall?.withSDP}
          isLoudSpeaker={getCallStore().isLoudSpeakerEnabled}
        />
      )}
      {getCallStore()
        .calls.filter(c => c.answered)
        .map(c => (
          <AnsweredItem key={c.id} voiceStreamObject={c.voiceStreamObject} />
        ))}
    </>
  )
})
