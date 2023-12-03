import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native'
import WebView, { WebViewMessageEvent } from 'react-native-webview'

import noPhoto from '../assets/no_photo.png'
import { buildWebViewSource } from '../config'
import { checkImageUrl } from '../utils/checkImageUrl'

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
const configViewPort =
  "const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); "

export const SmartImage = ({ uri, style }: { uri: string; style: object }) => {
  const [statusImageLoading, setStatusImageLoading] = useState(0)
  useEffect(() => {
    setStatusImageLoading(0)
    console.log(`SmartImage url=${uri}`)
  }, [uri])

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
  const isImageUrl = checkImageUrl(uri)

  return (
    <View style={[css.image, style]}>
      {!statusImageLoading && (
        <ActivityIndicator
          size='small'
          color='white'
          style={[css.loading, css.full]}
        />
      )}
      {!uri ? null : !isImageUrl ? (
        <WebView
          source={buildWebViewSource(uri)}
          injectedJavaScript={configViewPort}
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
          source={{ uri }}
          style={[css.image, css.full]}
          onError={onImageLoadError}
          onLoad={onImageLoad}
          resizeMode='cover'
        />
      )}
      {statusImageLoading === 2 && isImageUrl && (
        <Image
          source={noPhotoImg}
          style={[css.imageError, css.full]}
          resizeMode='cover'
        />
      )}
    </View>
  )
}
