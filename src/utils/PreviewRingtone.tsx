import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import type { ReactVideoSource, VideoRef } from 'react-native-video'
import Video from 'react-native-video'

import { staticRingtones } from '#/utils/BrekekeUtils'
import { isSameSource } from '#/utils/ringtonePicker'

interface PreviewRingtoneProps {
  source: string
  onReady?: () => void
  onError?: (e: any) => void
  onFinished?: () => void
}

const css = StyleSheet.create({
  video: { width: 0, height: 0 },
})

export default function PreviewRingtone({
  source,
  onReady,
  onError,
  onFinished,
}: PreviewRingtoneProps) {
  const playerRef = useRef<VideoRef | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [currentSource, setCurrentSource] = useState<ReactVideoSource>()
  const [didPlayStart, setDidPlayStart] = useState(false)

  const convertSource = (input: string): ReactVideoSource => {
    if (input === staticRingtones[0]) {
      return require('#/assets/incallmanager_ringtone.mp3')
    }
    return { uri: input }
  }

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    const converted = convertSource(source)
    if (isSameSource(converted, currentSource)) {
      return
    }
    setCurrentSource(converted)
    setDidPlayStart(false)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (!didPlayStart) {
        const fallback = convertSource('incallmanager_ringtone')
        setCurrentSource(fallback)
      }
    }, 1000)
  }, [source, didPlayStart, currentSource])

  const handleLoaded = () => {
    setDidPlayStart(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    onReady?.()
  }

  const handleError = (e: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setCurrentSource(require('#/assets/incallmanager_ringtone.mp3'))

    onError?.(e)
  }

  return (
    <View style={css.video}>
      <Video
        ref={playerRef}
        source={currentSource}
        onLoad={handleLoaded}
        onError={handleError}
        onEnd={onFinished}
      />
    </View>
  )
}
