import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native'
import WebView, { WebViewMessageEvent } from 'react-native-webview'

import noPhoto from '../assets/no_photo.png'

const URLParse = require('url')

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
  console.error({ url: p.uri })
  const styleBorderRadius = p.isLarge ? {} : { borderRadius: p.size / 2 }
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
  const checkUrlImage = (url: string) => {
    const ps = URLParse.parse(url.toLowerCase())
    return /\.(jpeg|jpg|gif|png)$/.test(ps.pathname)
  }
  // fix for exception get image from UC: https://apps.brekeke.com:8443/uc/image?ACTION=DOWNLOAD&tenant=nam&user=1003&dlk=ltt3&SIZE=40
  const isImageUrl =
    checkUrlImage(p.uri) ||
    p.uri
      .toLowerCase()
      .includes('/uc/image?ACTION=DOWNLOAD&tenant'.toLowerCase())

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
        <WebView
          source={{
            uri: p.uri,
          }}
          style={[css.image, { width: p.size, height: p.size }]}
          scalesPageToFit={true}
          bounces={false}
          startInLoadingState={true}
          onMessage={onMessage}
          onLoadEnd={onLoadEnd}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          resizeMode={'cover'}
        />
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
