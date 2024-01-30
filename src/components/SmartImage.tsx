import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native'
import WebView, { WebViewMessageEvent } from 'react-native-webview'
import { WebViewNavigationEvent } from 'react-native-webview/lib/WebViewTypes'

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
//ref: https://gomakethings.com/a-native-javascript-equivalent-of-jquerys-ready-method/
const onLoadJs =
  Platform.OS === 'ios'
    ? `
  window.addEventListener('load', function() {
    sendJsonToRn({loaded: true});
  });
`
    : `var ready = function ( fn ) {
  if ( typeof fn !== 'function' ) return;
  if ( document.readyState === 'complete'  ) {
    return fn();
  }
  // Otherwise, wait until document is loaded
  document.addEventListener( 'DOMContentLoaded', fn, false );
};
ready(function() {
  sendJsonToRn({loaded: true});
});
`
const configViewPort = `
const meta = document.createElement('meta'); 
meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); 
meta.setAttribute('name', 'viewport'); 
document.getElementsByTagName('head')[0].appendChild(meta);

function sendJsonToRn(json) {
  window.ReactNativeWebView.postMessage(JSON.stringify(json));
}
${onLoadJs}
`
enum StatusImage {
  loading = 0,
  loaded = 1,
  error = 2,
}
export const SmartImage = ({ uri, style }: { uri: string; style: object }) => {
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
      // For sure just update load page 1 time
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
      if (typeof json.loaded === 'boolean' && json.loaded === true) {
        setStatusImageLoading(StatusImage.loaded)
      }
    } catch (err) {
      return
    }
  }
  // For case Webview load  live stream camera url:
  // onLoadEnd, onLoad do not fire
  // We should be check url same or not to update Loading status
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
          onLoadStart={onLoadStart}
          onMessage={onMessage}
          onLoadEnd={onLoadEnd}
          onHttpError={onHttpError}
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
