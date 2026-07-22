import { observer } from 'mobx-react'
import { View } from 'rntwsc/tw/components/view'

import { RnActivityIndicator } from '#/components/rn-class-name-components'

export const VideoPlayer = observer(
  ({
    sourceObject,
    isShowLoading,
    objectFit,
  }: {
    sourceObject?: MediaStream | null
    isShowLoading?: boolean
    zOrder?: number
    objectFit?: 'contain' | 'cover'
  }) =>
    sourceObject ? (
      <video
        ref={video => {
          if (video) {
            video.srcObject = sourceObject
          }
        }}
        className={
          objectFit === 'contain'
            ? 'h-full w-full object-contain'
            : 'h-full w-full object-cover'
        }
        playsInline
        autoPlay
      />
    ) : isShowLoading ? (
      <RnActivityIndicator className='h-full w-full flex-1 p-12.5' />
    ) : (
      <View className='h-full w-full flex-1 p-12.5' />
    ),
)
