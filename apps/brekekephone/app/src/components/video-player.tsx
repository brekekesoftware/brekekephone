import { observer } from 'mobx-react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

const css = StyleSheet.create({
  loading: {
    flex: 1,
    width: '100%',
    height: '100%',
    padding: 50,
  },
})

export const VideoPlayer = observer(
  ({
    sourceObject,
    isShowLoading,
  }: {
    sourceObject?: MediaStream | null
    isShowLoading?: boolean
    zOrder?: number
  }) =>
    sourceObject ? (
      <video
        ref={video => {
          if (video) {
            video.srcObject = sourceObject
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        playsInline
        autoPlay
      />
    ) : isShowLoading ? (
      <ActivityIndicator style={css.loading} />
    ) : (
      <View style={css.loading} />
    ),
)
