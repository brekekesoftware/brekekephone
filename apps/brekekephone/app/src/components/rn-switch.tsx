import type { FC } from 'react'
import type { ViewProps } from 'react-native'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { v } from '#/components/variables'

export const RnSwitch: FC<
  ViewProps & {
    enabled: boolean
    className?: ClassName
  }
> = ({ enabled, style, className, ...p }) => (
  <View
    {...p}
    className={[
      'h-3 w-8 rounded-xl',
      enabled ? 'bg-primary-400' : 'bg-[#e6e6e6]',
      className,
    ]}
    style={style}
  >
    <View
      className={[
        'absolute -top-0.75 -left-px h-4.5 w-4.5 rounded-full',
        enabled ? 'translate-x-5 bg-primary' : 'bg-[#cccccc]',
      ]}
      style={v.boxShadow}
    />
  </View>
)
