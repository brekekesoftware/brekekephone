import { observer } from 'mobx-react'
import { ActivityIndicator } from 'react-native'

import { View } from '@/rn/core/components/view'

const loadingStyle = {
  flex: 1,
  width: '100%' as const,
  height: '100%' as const,
  padding: 50,
}

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
      <ActivityIndicator style={loadingStyle} />
    ) : (
      <View className='flex-1 w-full h-full p-12.5' />
    ),
)
