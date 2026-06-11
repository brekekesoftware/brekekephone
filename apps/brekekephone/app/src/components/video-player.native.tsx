import { observer } from 'mobx-react'

import { View } from '@/rn/core/components/view'
import { RnActivityIndicator } from '#/components/rn-class-name-components'
import { RnRTCView } from '#/components/rn-class-name-components.native'

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
      <RnRTCView
        streamURL={p.sourceObject.toURL()}
        className='h-full w-full'
        objectFit='cover'
        zOrder={p.zOrder}
      />
    ) : p.isShowLoading ? (
      <RnActivityIndicator className='h-full w-full' />
    ) : (
      <View className='h-full w-full' />
    ),
)
