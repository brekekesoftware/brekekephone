import { useEffect, useState } from 'react'
import { ActivityIndicator, Image } from 'react-native'

import { View } from '@/rn/core/components/view'
import noPhoto from '#/assets/no_photo.png'
import { ctx } from '#/stores/ctx'
import { checkImageUrl } from '#/utils/check-image-url'

const noPhotoImg = typeof noPhoto === 'string' ? { uri: noPhoto } : noPhoto

const imageStyle = {
  overflow: 'hidden' as const,
  backgroundColor: 'white',
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
}
const imageErrorStyle = {
  overflow: 'hidden' as const,
  backgroundColor: 'white',
  position: 'absolute' as const,
  top: 0,
  left: 0,
  zIndex: 100,
}
const loadingStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%' as const,
  height: '100%' as const,
  backgroundColor: '#00000030',
  overflow: 'hidden' as const,
  zIndex: 100,
}

export const SmartImage = (p: {
  uri: string
  style: object
  incoming: boolean
}) => {
  const [statusImageLoading, setStatusImageLoading] = useState(0)
  const [size, setSize] = useState(0)
  useEffect(() => {
    setStatusImageLoading(0)
  }, [p.uri])

  const onLoaded = () => {
    setStatusImageLoading(1)
  }
  const onImageLoadError = () => {
    setStatusImageLoading(2)
  }
  const onImageLoad = () => {
    setStatusImageLoading(1)
  }

  const isImageUrl =
    (ctx.auth.phoneappliEnabled() && !p.incoming) || checkImageUrl(p.uri)

  return (
    <View
      className='overflow-hidden bg-background justify-center items-center'
      style={p.style}
      onLayout={event => {
        const { height } = event.nativeEvent.layout
        setSize(height)
      }}
    >
      {!statusImageLoading && (
        <ActivityIndicator size='small' color='white' style={loadingStyle} />
      )}
      {!isImageUrl ? (
        <div>
          <iframe
            title='Load Image'
            src={p.uri}
            height={size}
            width={size}
            onLoad={onLoaded}
            frameBorder='0'
          />
        </div>
      ) : (
        <Image
          source={{
            uri: p.uri,
          }}
          style={[imageStyle, { width: size, height: size }]}
          onError={onImageLoadError}
          onLoad={onImageLoad}
          resizeMode='cover'
        />
      )}
      {statusImageLoading === 2 && isImageUrl && (
        <Image
          source={noPhotoImg}
          style={[imageErrorStyle, { width: size, height: size }]}
          resizeMode='cover'
        />
      )}
    </View>
  )
}
