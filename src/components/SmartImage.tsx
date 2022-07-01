import { useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native'

const css = StyleSheet.create({
  image: {
    overflow: 'hidden',
    backgroundColor: 'white',
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
  const onImageLoadError = () => {
    setStatusImageLoading(2)
  }
  const onImageLoad = () => {
    setStatusImageLoading(1)
  }
  const styleBorderRadius = p.isLarge ? {} : { borderRadius: p.size / 2 }
  // cache just reset when url change
  const resetCache = `${p.uri}?random=${Math.random()
    .toString(36)
    .substring(7)}`

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
      {statusImageLoading !== 2 && (
        <Image
          source={{
            uri: resetCache,
          }}
          style={[css.image, { width: p.size, height: p.size }]}
          onError={onImageLoadError}
          onLoad={onImageLoad}
          resizeMode={'cover'}
        />
      )}
      {statusImageLoading === 2 && (
        <Image
          source={require('../assets/no_photo.png')}
          style={[css.image, { width: p.size, height: p.size }]}
          resizeMode={'cover'}
        />
      )}
    </View>
  )
}
