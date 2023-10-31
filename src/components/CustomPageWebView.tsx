import { forwardRef, useRef } from 'react'
import { StyleSheet } from 'react-native'
import WebView, { WebViewMessageEvent } from 'react-native-webview'

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
interface Props {
  url: string
  onTitleChanged: (title: string) => void
  onLoadEnd: () => void
  onError: () => void
}
export const CustomPageWebView = forwardRef(
  ({ url, onTitleChanged, onLoadEnd, onError }: Props, ref) => {
    const webviewRef = useRef(null)

    const handleMessage = (message: WebViewMessageEvent) => {
      const title = message?.nativeEvent?.data
      if (!title) {
        return
      }
      onTitleChanged(title)
    }

    return (
      <WebView
        source={{
          uri: url,
        }}
        ref={webviewRef}
        injectedJavaScript='window.ReactNativeWebView.postMessage(document.title)'
        onMessage={handleMessage}
        style={[css.full]}
        bounces={false}
        startInLoadingState={true}
        onLoadEnd={onLoadEnd}
        onError={onError}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        scalesPageToFit={false}
      />
    )
  },
)
