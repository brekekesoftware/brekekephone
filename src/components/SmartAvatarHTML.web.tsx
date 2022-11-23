import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native'

import noPhoto from '../assets/no_photo.png'
import { checkImageUrl } from '../utils/checkImageURL'

const noPhotoImg = typeof noPhoto === 'string' ? { uri: noPhoto } : noPhoto
const css = StyleSheet.create({
  image: {
    overflow: 'hidden',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageError: {
    overflow: 'hidden',
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#00000030',
    overflow: 'hidden',
    zIndex: 100,
  },
})

export const SmartImage = (p: {
  uri: string
  size: number
  isLarge: boolean
}) => {
  const [statusImageLoading, setStatusImageLoading] = useState(0)

  useEffect(() => {
    setStatusImageLoading(0)
  }, [p.uri])

  const styleBorderRadius = p.isLarge ? {} : { borderRadius: p.size / 2 }

  const onLoaded = () => {
    setStatusImageLoading(1)
  }
  const onImageLoadError = () => {
    setStatusImageLoading(2)
  }
  const onImageLoad = () => {
    setStatusImageLoading(1)
  }

  const isImageUrl = checkImageUrl(p.uri)

  return (
    <View
      style={[css.image, { width: p.size, height: p.size }, styleBorderRadius]}
    >
      {!statusImageLoading && (
        <ActivityIndicator
          size='small'
          color='white'
          style={[css.loading, { width: p.size, height: p.size }]}
        />
      )}
      {!isImageUrl ? (
        <div>
          <iframe
            title='Load Image'
            src={p.uri}
            height={p.size}
            width={p.size}
            onLoad={onLoaded}
            frameBorder='0'
          />
        </div>
      ) : (
        <Image
          source={{
            uri: p.uri,
          }}
          style={[css.image, { width: p.size, height: p.size }]}
          onError={onImageLoadError}
          onLoad={onImageLoad}
          resizeMode={'cover'}
        />
      )}
      {statusImageLoading === 2 && isImageUrl && (
        <Image
          source={noPhotoImg}
          style={[css.imageError, { width: p.size, height: p.size }]}
          resizeMode={'cover'}
        />
      )}
    </View>
  )
}
