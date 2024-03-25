import { useRef } from 'react'
import { StyleSheet } from 'react-native'
import WebView, {
  WebViewMessageEvent,
  WebViewProps,
} from 'react-native-webview'
import { WebViewNavigationEvent } from 'react-native-webview/lib/WebViewTypes'

import { buildWebViewSource } from '../config'
import { webviewInjectSendJsonToRnOnLoad } from './webviewInjectSendJsonToRnOnLoad'

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

type Props = Pick<WebViewProps, 'onLoadStart' | 'onLoadEnd' | 'onError'> & {
  url: string
  onTitle(title: string): void
  onJsLoading(loading: boolean): void
}

export const CustomPageWebView = ({
  url,
  onTitle,
  onJsLoading,
  onLoadStart,
  onLoadEnd,
  onError,
}: Props) => {
  if (!url) {
    return null
  }
  const nLoading = useRef(false)
  const cUrl = useRef('')
  const onLoadStartForLoading = (e: WebViewNavigationEvent) => {
    const cPageUrl = e?.nativeEvent?.url
    if (!cPageUrl || cPageUrl === cUrl.current) {
      return
    }
    nLoading.current = true
    cUrl.current = cPageUrl
    onLoadStart?.(e)
  }
  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const data = e?.nativeEvent?.data
      if (!data) {
        return
      }
      if (!nLoading.current) {
        return
      }
      const json = JSON.parse(data)
      if (!json) {
        return
      }
      if (json.title) {
        onTitle(json.title)
      }
      if (typeof json.loading === 'boolean') {
        onJsLoading(json.loading)
        if (!json.loading) {
          nLoading.current = false
        }
      }
    } catch (err) {
      return
    }
  }

  return (
    <WebView
      source={buildWebViewSource(url)}
      injectedJavaScript={js}
      style={css.full}
      bounces={false}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      scalesPageToFit={false}
      onMessage={onMessage}
      onLoadStart={onLoadStartForLoading}
      onLoadEnd={onLoadEnd}
      onError={onError}
    />
  )
}

const js = `
  function sendJsonToRn(json) {
    window.ReactNativeWebView.postMessage(JSON.stringify(json));
  }
  sendJsonToRn({
    loading: true,
    title: document.title,
  });
  ${webviewInjectSendJsonToRnOnLoad(true)}
  // https://stackoverflow.com/a/29540461
  function addTitleListener() {
    var titleDomNode = document.querySelector('title');
    if (!titleDomNode) {
      // TODO handle if html has no title
      return false;
    }
    var observer = new MutationObserver(function() {
      sendJsonToRn({ title: document.title });
    });
    observer.observe(titleDomNode, { subtree: true, characterData: true, childList: true });
    return true;
  }
`
