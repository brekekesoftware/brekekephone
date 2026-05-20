import { observer } from 'mobx-react'

import { View } from '@/rn/core/components/view'
import { RnActivityIndicator } from '#/components/rn-activity-indicator'

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
        className='w-full h-full object-cover'
        playsInline
        autoPlay
      />
    ) : isShowLoading ? (
      <RnActivityIndicator className='flex-1 w-full h-full p-12.5' />
    ) : (
      <View className='flex-1 w-full h-full p-12.5' />
    ),
)
