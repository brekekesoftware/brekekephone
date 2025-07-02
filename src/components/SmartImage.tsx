import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native'
import type { WebViewMessageEvent } from 'react-native-webview'
import WebView from 'react-native-webview'
import type { WebViewNavigationEvent } from 'react-native-webview/lib/WebViewTypes'

import noPhoto from '#/assets/no_photo.png'

import { webviewInjectSendJsonToRnOnLoad } from '#/components/webviewInjectSendJsonToRnOnLoad'
import { isAndroid } from '#/config'
import { ctx } from '#/stores/ctx'
import { checkImageUrl } from '#/utils/checkImageUrl'

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

const js = `
// set meta data config viewport
const meta = document.createElement('meta');
meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0');
meta.setAttribute('name', 'viewport');
document.getElementsByTagName('head')[0].appendChild(meta);
// send data to rn to stop loading
function sendJsonToRn(json) {
  window.ReactNativeWebView.postMessage(JSON.stringify(json));
}

${webviewInjectSendJsonToRnOnLoad()}
`
enum StatusImage {
  loading = 0,
  loaded = 1,
  error = 2,
}

const getNoCacheUri = (uri: string) => {
  const sep = uri.includes('?') ? '&' : '?'
  return `${uri}${sep}nocache=${Date.now()}`
}

export const SmartImage = ({
  uri,
  style,
  incoming,
}: {
  uri: string
  style: object
  incoming: boolean
}) => {
  const [statusImageLoading, setStatusImageLoading] = useState(
    StatusImage.loading,
  )
  const cUrl = useRef(uri)
  useEffect(() => {
    setStatusImageLoading(0)
    console.log(`SmartImage url=${uri}`)
  }, [uri])

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      // for sure just update load page 1 time
      if (statusImageLoading === StatusImage.loaded) {
        return
      }
      const data = event?.nativeEvent?.data
      if (!data) {
        return
      }
      const json = JSON.parse(data)
      if (!json) {
        return
      }
      if (typeof json.loading === 'boolean' && json.loading === false) {
        setStatusImageLoading(StatusImage.loaded)
      }
    } catch (err) {
      return
    }
  }
  // for case Webview load  live stream camera url:
  // onLoadEnd, onLoad do not fire
  // we should be check url same or not to update loading status
  const onLoadStart = (e: WebViewNavigationEvent) => {
    const cPageUrl = e?.nativeEvent?.url
    if (!cPageUrl || cPageUrl === cUrl.current) {
      return
    }
    cUrl.current = cPageUrl
    setStatusImageLoading(StatusImage.loading)
  }
  const onLoadEnd = () => {
    setStatusImageLoading(StatusImage.loaded)
  }
  const onImageLoadError = () => {
    setStatusImageLoading(StatusImage.error)
  }
  const onImageLoad = () => {
    setStatusImageLoading(StatusImage.loaded)
  }
  const onHttpError = () => {
    setStatusImageLoading(StatusImage.loaded)
  }
  const isImageUrl =
    (ctx.auth.phoneappliEnabled() && !incoming) || checkImageUrl(uri)

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
          source={{ uri }}
          injectedJavaScript={js}
          injectedJavaScriptBeforeContentLoaded={isAndroid ? js : ''}
          style={[css.image, css.full]}
          bounces={false}
          onLoadStart={onLoadStart}
          onMessage={onMessage}
          onLoadEnd={onLoadEnd}
          onHttpError={onHttpError}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          scalesPageToFit={false}
          userAgent={ctx.auth.getUserAgentConfig()}
        />
      ) : (
        <Image
          source={{
            uri: getNoCacheUri(uri),
          }}
          style={[css.image, css.full]}
          onError={onImageLoadError}
          onLoad={onImageLoad}
          resizeMode='cover'
        />
      )}
      {statusImageLoading === StatusImage.error && isImageUrl && (
        <Image
          source={noPhotoImg}
          style={[css.imageError, css.full]}
          resizeMode='cover'
        />
      )}
    </View>
  )
}
