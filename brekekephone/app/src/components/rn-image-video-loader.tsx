import type { FC } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ViewProps } from 'react-native'
import { View } from 'rntwsc/tw/components/view'

import { mdiImageBrokenVariant, mdiPlayCircleOutline } from '@/assets/icons'
import { RnActivityIndicator } from '@/components/rn-class-name-components'
import { RnIcon } from '@/components/rn-icon'
import { RnTouchableOpacity } from '@/components/rn-touchable-opacity'
import type { ChatFile } from '@/stores/chat-store'

const size = 200

export const RnImageVideoLoader: FC<ViewProps & ChatFile> = ({
  url,
  state,
  fileType,
}) => {
  const [objectUrl, setObjectUrl] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)

  const onShowImage = useCallback(() => {
    const image = new Image()
    image.src = objectUrl || ''
    const w = window.open('')
    w?.document.write(image.outerHTML)
  }, [objectUrl])

  const onPlayVideo = useCallback(() => {
    const video = videoRef.current
    if (!video) {
      return
    }
    video.play().catch(() => {})
    if (video.requestFullscreen) {
      video.requestFullscreen().catch(() => {})
    }
  }, [])

  const readImage = async (_: string) => {
    try {
      const urlImage = _.split('/')
      const cache = await caches.open(urlImage[0])
      const request = new Request(urlImage[1])
      const response = await cache.match(request)
      const blobFile = await response?.blob()
      if (blobFile) {
        setObjectUrl(window.URL.createObjectURL(blobFile))
      }
    } catch (err) {
      setObjectUrl('')
      console.error('ImageVideoLoader.readImage error:', err)
    }
  }
  useEffect(() => {
    if (url) {
      readImage(url)
    }
  }, [url])

  // Pause the inline video when the user leaves the browser fullscreen so the
  // thumbnail returns to its resting state (frame + play button overlay).
  useEffect(() => {
    const onFullscreenChange = () => {
      const video = videoRef.current
      if (!document.fullscreenElement && video) {
        video.pause()
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [])

  const renderView = () => {
    if (fileType === 'image') {
      return (
        <RnTouchableOpacity onPress={onShowImage}>
          <img
            src={objectUrl}
            className='rounded-card h-50 w-50 overflow-hidden object-cover'
          />
        </RnTouchableOpacity>
      )
    }
    return (
      <View className='bg-modal-overlay rounded-card h-50 w-50 overflow-hidden'>
        <video
          ref={videoRef}
          controls
          src={objectUrl}
          playsInline
          preload='metadata'
          width={size}
          height={size}
        />
        <RnTouchableOpacity
          accessibilityRole='button'
          className='bg-modal-overlay absolute inset-0 items-center justify-center'
          onPress={onPlayVideo}
        >
          <RnIcon
            path={mdiPlayCircleOutline}
            className='text-white'
            size={40}
          />
        </RnTouchableOpacity>
      </View>
    )
  }
  const isLoading =
    state !== 'success' && state !== 'failure' && state !== 'stopped'
  const isLoadFailed = state === 'failure' || state === 'stopped'
  const isLoadSuccess = state === 'success' && !!objectUrl
  if (state === 'success' && !objectUrl) {
    return null
  }
  return (
    <View className='rounded-card h-50 w-50 items-center justify-center overflow-hidden'>
      {isLoading && (
        <View className='bg-modal-overlay absolute inset-0 items-center justify-center'>
          <RnActivityIndicator size='small' className='h-9 w-9 text-white' />
        </View>
      )}
      {isLoadSuccess && renderView()}
      {isLoadFailed && (
        <RnIcon
          path={mdiImageBrokenVariant}
          size={size}
          viewBox='3 3  18 18'
          className='text-foreground-subtle'
        />
      )}
    </View>
  )
}
