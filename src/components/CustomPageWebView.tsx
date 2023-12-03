import { StyleSheet } from 'react-native'
import WebView, { WebViewMessageEvent } from 'react-native-webview'

import { buildWebViewSource } from '../config'

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

type Props = {
  url: string
  onTitleChanged(title: string): void
  onLoadEnd(): void
  onError(): void
}

export const CustomPageWebView = ({
  url,
  onTitleChanged,
  onLoadEnd,
  onError,
}: Props) => {
  if (!url) {
    return null
  }
  const handleMessage = (message: WebViewMessageEvent) => {
    const title = message?.nativeEvent?.data
    if (!title) {
      return
    }
    onTitleChanged(title)
  }
  return (
    <WebView
      source={buildWebViewSource(url)}
      injectedJavaScript='window.ReactNativeWebView.postMessage(document.title)'
      onMessage={handleMessage}
      style={css.full}
      bounces={false}
      startInLoadingState={true}
      onLoadEnd={onLoadEnd}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      scalesPageToFit={false}
      onHttpError={onError}
      onError={onError}
    />
  )
}
