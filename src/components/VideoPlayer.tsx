import { observer } from 'mobx-react'
import { ActivityIndicator, StyleSheet } from 'react-native'
import { RTCView } from 'react-native-webrtc'

const css = StyleSheet.create({
  video: {
    flex: 1,
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
  (p: { sourceObject?: MediaStream | null }) =>
    p.sourceObject ? (
      <RTCView
        streamURL={p.sourceObject.toURL()}
        style={css.video}
        objectFit='cover'
      />
    ) : (
      <ActivityIndicator style={css.video} />
    ),
)
