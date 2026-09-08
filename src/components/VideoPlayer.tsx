import { observer } from 'mobx-react'
import type { StyleProp, ViewStyle } from 'react-native'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { RTCView } from 'react-native-webrtc'

const css = StyleSheet.create({
  video: {
    width: '100%',
    height: '100%',
  },
})

declare global {
  interface MediaStream {
    toURL(): string
  }
}

export const VideoPlayer = observer(
  (p: {
    sourceObject?: MediaStream | null
    zOrder?: number
    style?: StyleProp<ViewStyle>
    isShowLoading?: boolean
  }) =>
    p.sourceObject ? (
      <RTCView
        streamURL={p.sourceObject.toURL()}
        style={[css.video, p.style]}
        objectFit='cover'
        zOrder={p.zOrder}
      />
    ) : p.isShowLoading ? (
      <ActivityIndicator style={css.video} />
    ) : (
      <View style={css.video} />
    ),
)
