import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import type { VideoRef } from 'react-native-video'
import Video from 'react-native-video'

import { ctx } from '#/stores/ctx'

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
  const videoRef = useRef<VideoRef>(null)
  const isPlaying = ctx.chat.chatNotificationSoundRunning
  // AVAudioSession will conflict if <Video> is mounted multiple times consecutively
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.seek(0)
    }
  }, [isPlaying])

  return (
    <Video
      ref={videoRef}
      source={require('../assets/ding.mp3')}
      style={css.video}
      disableAudioSessionManagement={true}
      paused={!isPlaying}
    />
  )
})
