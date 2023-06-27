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
    oc &&
    !oc.incoming &&
    !oc.answered &&
    (oc.sessionStatus === 'progress' || oc.sessionStatus === 'dialing')
  return (
    <>
      {isOutgoingCallStart &&
        (oc?.withSDP ? (
          <OutgoingItemWithSDP earlyMedia={oc.earlyMedia} />
        ) : (
          <OutgoingItem />
        ))}
      {Platform.OS === 'ios' && isOutgoingCallStart && (
        <VideoRBT
          withSDP={!!oc?.withSDP}
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
