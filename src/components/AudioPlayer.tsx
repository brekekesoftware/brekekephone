import { observer } from 'mobx-react'
import { StyleSheet } from 'react-native'
import Video from 'react-native-video'

import { chatStore } from '../stores/chatStore'

const css = StyleSheet.create({
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
})
export const AudioPlayer = observer(() => {
  return chatStore.chatNotificationSoundRunning ? (
    <Video
      source={require('../assets/ding.mp3')}
      style={css.video}
      // ignoreSilentSwitch="ignore"
      // playInBackground={true}
      // playWhenInactive={true}
    />
  ) : null
})
