import { observer } from 'mobx-react'

import { View } from '@/rn/core/components/view'
import { RnActivityIndicator } from '#/components/rn-class-name-components'

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
        className='h-full w-full object-cover'
        playsInline
        autoPlay
      />
    ) : isShowLoading ? (
      <RnActivityIndicator className='h-full w-full flex-1 p-12.5' />
    ) : (
      <View className='h-full w-full flex-1 p-12.5' />
    ),
)
