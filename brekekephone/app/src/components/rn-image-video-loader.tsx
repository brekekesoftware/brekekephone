import { View } from '@rntwsc/rn/core/components/view'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { ViewProps } from 'react-native'

import { mdiImageBrokenVariant } from '#/assets/icons'
import {
  RnActivityIndicator,
  RnFastImage,
} from '#/components/rn-class-name-components'
import { RnIcon } from '#/components/rn-icon'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import type { ChatFile } from '#/stores/chat-store'

const size = 200

export const RnImageVideoLoader: FC<ViewProps & ChatFile> = ({
  url,
  state,
  fileType,
}) => {
  const [objectUrl, setObjectUrl] = useState<string>('')

  const onShowImage = useCallback(() => {
    const image = new Image()
    image.src = objectUrl || ''
    const w = window.open('')
    w?.document.write(image.outerHTML)
  }, [objectUrl])

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

  const renderView = () => {
    if (fileType === 'image') {
      return (
        <RnTouchableOpacity onPress={onShowImage}>
          <RnFastImage
            source={{
              uri: objectUrl,
            }}
            className='rounded-card h-50 w-50 overflow-hidden'
          />
        </RnTouchableOpacity>
      )
    } else {
      return (
        <View className='bg-modal-overlay rounded-card h-50 w-50 overflow-hidden'>
          <video
            controls
            src={objectUrl}
            playsInline
            width={size}
            height={size}
          />
        </View>
      )
    }
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
        <View className='bg-modal-overlay absolute inset-0'>
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
