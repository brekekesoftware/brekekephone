import type { ClassName } from '@rntwsc/rn/core/tw/class-name'
import { createClassNameComponent } from '@rntwsc/rn/core/tw/lib/create-class-name-component'
import type { ComponentProps, FC } from 'react'
import VideoWocn from 'react-native-video'
import { RTCView as RTCViewWocn } from 'react-native-webrtc'
import WebViewWocn from 'react-native-webview'

export * from '#/components/rn-class-name-components-shared'

export const RnVideo = createClassNameComponent({
  VideoWocn,
}) as FC<ComponentProps<typeof VideoWocn> & { className?: ClassName }>

export const RnRTCView = createClassNameComponent({
  RTCViewWocn,
}) as FC<ComponentProps<typeof RTCViewWocn> & { className?: ClassName }>

export const RnWebView = createClassNameComponent({
  WebViewWocn,
}) as FC<ComponentProps<typeof WebViewWocn> & { className?: ClassName }>
