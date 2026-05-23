import type { ComponentProps, FC } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Image as ImageWocn } from 'react-native'
import type { WebViewMessageEvent } from 'react-native-webview'
import WebViewWocn from 'react-native-webview'
import type { WebViewNavigationEvent } from 'react-native-webview/lib/WebViewTypes'

import noPhoto from '#/assets/no_photo.png'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'
import { isAndroid } from '@/rn/core/utils/platform'
import { RnActivityIndicator } from '#/components/rn-activity-indicator'
import { webviewInjectSendJsonToRnOnLoad } from '#/components/webview-inject-send-json-to-rn-on-load'
import { ctx } from '#/stores/ctx'
import { checkImageUrl } from '#/utils/check-image-url'

const Image = createClassNameComponent({ ImageWocn }) as FC<
  ComponentProps<typeof ImageWocn> & { className?: ClassName }
>
const WebView = createClassNameComponent({ WebViewWocn }) as FC<
  ComponentProps<typeof WebViewWocn> & { className?: ClassName }
>

const noPhotoImg = typeof noPhoto === 'string' ? { uri: noPhoto } : noPhoto

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
  className,
  incoming,
}: {
  uri: string
  className?: ClassName
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
      console.error(err)
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

  const nocacheUri = useMemo(() => getNoCacheUri(uri), [uri])
  return (
    <View className={['bg-background overflow-hidden', className]}>
      {!statusImageLoading && (
        <RnActivityIndicator
          size='small'
          color='white'
          className='bg-modal-overlay absolute top-0 left-0 z-100 h-full w-full overflow-hidden opacity-30'
        />
      )}
      {!uri ? null : !isImageUrl ? (
        <WebView
          source={{ uri }}
          injectedJavaScript={js}
          injectedJavaScriptBeforeContentLoaded={isAndroid ? js : ''}
          className='bg-background h-full w-full overflow-hidden'
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
            uri: nocacheUri,
          }}
          className='bg-background h-full w-full overflow-hidden'
          onError={onImageLoadError}
          onLoad={onImageLoad}
          resizeMode='cover'
        />
      )}
      {statusImageLoading === StatusImage.error && isImageUrl && (
        <Image
          source={noPhotoImg}
          className='bg-background absolute top-0 left-0 z-100 h-full w-full overflow-hidden'
          resizeMode='cover'
        />
      )}
    </View>
  )
}
