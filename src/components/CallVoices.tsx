import { observer } from 'mobx-react'
import { Platform, StyleSheet } from 'react-native'
import Video from 'react-native-video'

import { callStore } from '../stores/callStore'
import { AnsweredItem, OutgoingItem, OutgoingItemWithSDP } from './CallVoicesUI'

const css = StyleSheet.create({
  video: {
    width: 0,
    height: 0,
  },
})
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

  const outgoingWithSDP =
    currentCall && currentCall?.withSDP && currentCall?.earlyMedia

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
        Platform.OS === 'ios' && (
          <Video
            source={require('../assets/incallmanager_ringback.mp3')}
            style={css.video}
            paused={!isOutgoingCallStart || !!outgoingWithSDP}
            repeat={true}
            playInBackground={true}
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
