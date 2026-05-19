import type { FC } from 'react'
import { StatusBar } from 'react-native'

import { View } from '@/rn/core/components/view'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { v } from '#/components/variables'
import { isIos, isWeb } from '#/config'

// elevation (Android-only RN prop) — no Tailwind equivalent, keep inline
const elevationStyle = { elevation: 999 }

export type TRnStatusBarProps = {
  danger?: boolean
  warning?: boolean
  onPress?(): void
}
export const RnStatusBar: FC<TRnStatusBarProps> = p =>
  isWeb ? null : (
    <RnTouchableOpacity
      className={[
        'z-999 bg-muted',
        isIos && 'h-0',
        p.warning && 'bg-warning border-warning',
        p.danger && 'bg-error border-error',
      ]}
      style={elevationStyle}
      onPress={p.onPress}
    >
      <StatusBar
        backgroundColor={
          p.danger ? v.colors.danger : p.warning ? v.colors.warning : v.hoverBg
        }
        barStyle='dark-content'
      />
      <View
        className='absolute bottom-0 left-0 right-0 border-b border-border z-999'
        style={elevationStyle}
      />
    </RnTouchableOpacity>
  )
