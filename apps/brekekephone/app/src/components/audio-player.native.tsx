import { observer } from 'mobx-react'
import { useEffect, useRef } from 'react'
import type { VideoRef } from 'react-native-video'
import Video from 'react-native-video'

import { ctx } from '#/stores/ctx'
import { RnAppState } from '#/stores/rn-app-state'
import { BrekekeUtils } from '#/utils/brekeke-utils'

const videoStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  opacity: 0,
  overflow: 'hidden' as const,
}

export const AudioPlayer = observer(() => {
  const videoRef = useRef<VideoRef>(null)
  const isPlaying = ctx.chat.chatNotificationSoundRunning
  // AVAudioSession will conflict if <Video> is mounted multiple times consecutively
  useEffect(() => {
    if (
      !ctx.call.calls.length &&
      RnAppState.currentState === 'active' &&
      isPlaying
    ) {
      BrekekeUtils.resetAudioConfig()
    }
    if (isPlaying && videoRef.current) {
      videoRef.current.seek(0)
    }
  }, [isPlaying])

  return (
    <Video
      ref={videoRef}
      source={require('../assets/ding.mp3')}
      style={videoStyle}
      disableAudioSessionManagement={true}
      paused={!isPlaying}
      preventsDisplaySleepDuringVideoPlayback={isPlaying}
    />
  )
})
