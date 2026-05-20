import { observer } from 'mobx-react'
import type { ComponentProps, FC } from 'react'
import { RTCView as RTCViewWocn } from 'react-native-webrtc'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'
import { RnActivityIndicator } from '#/components/rn-activity-indicator'

const RTCView = createClassNameComponent({ RTCViewWocn }) as FC<
  ComponentProps<typeof RTCViewWocn> & { className?: ClassName }
>

declare global {
  interface MediaStream {
    toURL(): string
  }
}

export const VideoPlayer = observer(
  (p: {
    sourceObject?: MediaStream | null
    zOrder?: number
    isShowLoading?: boolean
  }) =>
    p.sourceObject ? (
      <RTCView
        streamURL={p.sourceObject.toURL()}
        className='w-full h-full'
        objectFit='cover'
        zOrder={p.zOrder}
      />
    ) : p.isShowLoading ? (
      <RnActivityIndicator className='w-full h-full' />
    ) : (
      <View className='w-full h-full' />
    ),
)
