import type { FC } from 'react'
import { StatusBar } from 'react-native'

import { View } from '@/rn/core/components/view'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { isIos, isWeb } from '#/config'
import { variables as defaultVariables } from '#/theme/brekeke-scss'
import { useThemeVariables } from '#/utils/rn-core-hooks'

export type TRnStatusBarProps = {
  danger?: boolean
  warning?: boolean
  onPress?(): void
}

const RnStatusBarNative: FC<TRnStatusBarProps> = p => {
  const variables = useThemeVariables() || defaultVariables
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
      <StatusBar
        backgroundColor={
          p.danger
            ? variables['--error-500']
            : p.warning
              ? variables['--warning-500']
              : variables['--muted']
        }
        barStyle='dark-content'
      />
      <View className='border-border android:elevation-999 absolute right-0 bottom-0 left-0 z-999 border-b' />
    </RnTouchableOpacity>
  )
}

export const RnStatusBar: FC<TRnStatusBarProps> = p =>
  isWeb ? null : <RnStatusBarNative {...p} />
