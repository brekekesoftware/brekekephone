import { observer } from 'mobx-react'
import type { StyleProp, ViewStyle } from 'react-native'
import { ActivityIndicator, StyleSheet } from 'react-native'
import { RTCView } from 'react-native-webrtc'

const css = StyleSheet.create({
  video: {
    width: '100%',
    height: '100%',
    // backgroundColor: 'black'
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
  }) =>
    p.sourceObject ? (
      <RTCView
        streamURL={p.sourceObject.toURL()}
        style={[css.video, p.style]}
        objectFit='cover'
        zOrder={p.zOrder}
      />
    ) : (
      <ActivityIndicator style={css.video} />
    ),
)
