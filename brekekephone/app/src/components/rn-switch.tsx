import { View } from '@rntwsc/rn/core/components/view'
import type { ClassName } from '@rntwsc/rn/core/tw/class-name'
import type { FC } from 'react'
import type { ViewProps } from 'react-native'

export const RnSwitch: FC<
  Omit<ViewProps, 'style'> & {
    enabled: boolean
    className?: ClassName
  }
> = ({ enabled, className, ...p }) => (
  <View
    {...p}
    className={[
      'h-3 w-8 rounded-xl',
      enabled ? 'bg-primary-400' : 'bg-foreground-disabled',
      className,
    ]}
  >
    <View
      className={[
        'absolute -top-0.75 -left-px h-4.5 w-4.5 rounded-full shadow-sm',
        enabled ? 'bg-primary translate-x-5' : 'bg-foreground-disabled',
      ]}
    />
  </View>
)
