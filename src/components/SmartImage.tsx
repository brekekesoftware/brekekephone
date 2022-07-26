import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native'

import noPhoto from '../assets/no_photo.png'

const noPhotoImg = typeof noPhoto === 'string' ? { uri: noPhoto } : noPhoto

const css = StyleSheet.create({
  image: {
    overflow: 'hidden',
    backgroundColor: 'white',
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

  const onImageLoadError = () => {
    setStatusImageLoading(2)
  }
  const onImageLoad = () => {
    setStatusImageLoading(1)
  }
  const styleBorderRadius = p.isLarge ? {} : { borderRadius: p.size / 2 }
  return (
    <View
      style={[css.image, { width: p.size, height: p.size }, styleBorderRadius]}
    >
      {statusImageLoading === 0 && (
        <ActivityIndicator
          size='small'
          color='white'
          style={[css.loading, { width: p.size, height: p.size }]}
        />
      )}
      <Image
        source={{
          uri: p.uri,
        }}
        style={[css.image, { width: p.size, height: p.size }]}
        onError={onImageLoadError}
        onLoad={onImageLoad}
        resizeMode={'cover'}
      />
      {statusImageLoading === 2 && (
        <Image
          source={noPhotoImg}
          style={[css.imageError, { width: p.size, height: p.size }]}
          resizeMode={'cover'}
        />
      )}
    </View>
  )
}
