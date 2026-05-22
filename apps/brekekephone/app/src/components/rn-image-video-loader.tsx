import type { ComponentProps, FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { ViewProps } from 'react-native'
import FastImageWocn from 'react-native-fast-image'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'
import { mdiImageBrokenVariant } from '#/assets/icons'
import { RnActivityIndicator } from '#/components/rn-activity-indicator'
import { RnIcon } from '#/components/rn-icon'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import type { ChatFile } from '#/stores/chat-store'

const FastImage = createClassNameComponent({ FastImageWocn }) as FC<
  ComponentProps<typeof FastImageWocn> & { className?: ClassName }
>

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
          <FastImage
            source={{ uri: objectUrl }}
            className='h-50 w-50 overflow-hidden rounded-[5px]'
          />
        </RnTouchableOpacity>
      )
    } else {
      return (
        <View className='bg-modal-overlay h-50 w-50 overflow-hidden rounded-[5px]'>
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
    <View className='h-50 w-50 items-center justify-center overflow-hidden rounded-[5px]'>
      {isLoading && (
        <View className='bg-modal-overlay absolute top-0 left-0 h-50 w-50 items-center justify-center overflow-hidden rounded-[5px]'>
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
