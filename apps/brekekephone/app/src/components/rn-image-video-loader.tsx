import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { ViewProps } from 'react-native'
import { ActivityIndicator } from 'react-native'
import FastImage from 'react-native-fast-image'
import Svg, { Path } from 'react-native-svg'

import { View } from '@/rn/core/components/view'
import { mdiImageBrokenVariant } from '#/assets/icons'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { v } from '#/components/variables'
import type { ChatFile } from '#/stores/chat-store'

const size = 200
const imageStyle = {
  width: size,
  height: size,
  borderRadius: 5,
  overflow: 'hidden' as const,
}
const loadingStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  backgroundColor: v.layerBg,
  width: size,
  height: size,
  borderRadius: 5,
  overflow: 'hidden' as const,
}

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
          <FastImage source={{ uri: objectUrl }} style={imageStyle} />
        </RnTouchableOpacity>
      )
    } else {
      return (
        <View className='w-50 h-50 rounded-[5px] overflow-hidden bg-layer-video'>
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
    <View className='w-50 h-50 rounded-[5px] overflow-hidden'>
      {isLoading && (
        <ActivityIndicator size='small' color='white' style={loadingStyle} />
      )}
      {isLoadSuccess && renderView()}
      {isLoadFailed && (
        <Svg
          preserveAspectRatio='xMinYMin slice'
          height={size}
          viewBox='3 3  18 18'
          width={size}
        >
          <Path d={mdiImageBrokenVariant} fill={v.colors.greyTextChat} />
        </Svg>
      )}
    </View>
  )
}
