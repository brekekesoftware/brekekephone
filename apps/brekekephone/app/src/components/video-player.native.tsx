import { observer } from 'mobx-react'
import type { StyleProp, ViewStyle } from 'react-native'
import { ActivityIndicator } from 'react-native'
import { RTCView } from 'react-native-webrtc'

import { View } from '@/rn/core/components/view'

const videoStyle = {
  width: '100%' as const,
  height: '100%' as const,
}

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
        style={[videoStyle, p.style]}
        objectFit='cover'
        zOrder={p.zOrder}
      />
    ) : p.isShowLoading ? (
      <ActivityIndicator style={videoStyle} />
    ) : (
      <View className='w-full h-full' />
    ),
)
