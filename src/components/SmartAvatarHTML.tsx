import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native'
import WebView, { WebViewMessageEvent } from 'react-native-webview'

import noPhoto from '../assets/no_photo.png'
import { checkImageUrl } from '../utils/checkImageURL'

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
  full: {
    width: '100%',
    height: '100%',
  },
})

export const SmartImage = (p: {
  uri: string
  size: number
  isLarge: boolean
  style: object
}) => {
  const [statusImageLoading, setStatusImageLoading] = useState(0)

  useEffect(() => {
    setStatusImageLoading(0)
  }, [p.uri])
  console.log(`SmartImage url=${p.uri}`)
  const styleBorderRadius = p.isLarge
    ? {}
    : { borderRadius: 200, width: 100, height: 100 }
  const onMessage = (event: WebViewMessageEvent) => {
    setStatusImageLoading(1)
  }
  const onLoadEnd = () => {
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
    <View style={[css.image, p.style, styleBorderRadius]}>
      {!statusImageLoading && (
        <ActivityIndicator
          size='small'
          color='white'
          style={[css.loading, css.full]}
        />
      )}
      {!isImageUrl ? (
        <WebView
          source={{
            uri: p.uri,
          }}
          style={[css.image, css.full]}
          bounces={false}
          startInLoadingState={true}
          onMessage={onMessage}
          onLoadEnd={onLoadEnd}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          scalesPageToFit={false}
        />
      ) : (
        <Image
          source={{
            uri: p.uri,
          }}
          style={[css.image, css.full]}
          onError={onImageLoadError}
          onLoad={onImageLoad}
          resizeMode={'cover'}
        />
      )}
      {statusImageLoading === 2 && isImageUrl && (
        <Image
          source={noPhotoImg}
          style={[css.imageError, css.full]}
          resizeMode={'cover'}
        />
      )}
    </View>
  )
}
