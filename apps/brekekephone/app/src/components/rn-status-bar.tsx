import type { FC } from 'react'
import { StatusBar } from 'react-native'

import { View } from '@/rn/core/components/view'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { v } from '#/components/variables'
import { isIos, isWeb } from '#/config'

export type TRnStatusBarProps = {
  danger?: boolean
  warning?: boolean
  onPress?(): void
}
export const RnStatusBar: FC<TRnStatusBarProps> = p =>
  isWeb ? null : (
    <RnTouchableOpacity
      className={[
        'android:elevation-999 bg-muted z-999',
        isIos && 'h-0',
        p.warning && 'bg-warning border-warning',
        p.danger && 'bg-error border-error',
      ]}
      onPress={p.onPress}
    >
      <StatusBar
        backgroundColor={
          p.danger ? v.colors.danger : p.warning ? v.colors.warning : v.hoverBg
        }
        barStyle='dark-content'
      />
      <View className='border-border android:elevation-999 absolute right-0 bottom-0 left-0 z-999 border-b' />
    </RnTouchableOpacity>
  )
