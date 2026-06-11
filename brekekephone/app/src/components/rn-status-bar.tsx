import { View } from '@rntwsc/rn/core/components/view'
import { isIos, isWeb } from '@rntwsc/rn/core/utils/platform'
import type { FC } from 'react'
import { StatusBar } from 'react-native'

import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { useRuntimeStyle } from '#/utils/rn-core-hooks'

export type TRnStatusBarProps = {
  danger?: boolean
  warning?: boolean
  onPress?(): void
}

const RnStatusBarNative: FC<TRnStatusBarProps> = p => {
  const color = useRuntimeStyle(
    p.danger ? 'text-error-500' : p.warning ? 'text-warning-500' : 'text-muted',
  )?.color as string
  const barStyle = isDark(color) ? 'light-content' : 'dark-content'

  return (
    <RnTouchableOpacity
      className={[
        'android:elevation-999 bg-muted z-999',
        isIos && 'h-0',
        p.warning && 'bg-warning border-warning',
        p.danger && 'bg-error border-error',
      ]}
      onPress={p.onPress}
    >
      <StatusBar backgroundColor={color} barStyle={barStyle} />
      <View className='border-border android:elevation-999 absolute right-0 bottom-0 left-0 z-999 border-b' />
    </RnTouchableOpacity>
  )
}

export const RnStatusBar: FC<TRnStatusBarProps> = p =>
  isWeb ? null : <RnStatusBarNative {...p} />

const isDark = (hex: string) => {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  // Perceived luminance (ITU-R BT.709)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128
}
