import type { FC } from 'react'
import Svg, { Path } from 'react-native-svg'

import type { ViewProps } from '@/rn/core/components/view'
import { View } from '@/rn/core/components/view'
import { v } from '#/components/variables'
import { useRuntimeStyle } from '#/utils/rn-core-hooks'

export const RnIcon: FC<
  ViewProps & {
    color?: string
    path: string
    size?: number
    viewBox?: string
  }
> = ({ color, path, size = v.iconSize, viewBox, className, ...p }) => {
  const style = useRuntimeStyle(['text-foreground', className])
  const color2 = style?.color || color
  return (
    <View {...p} className={['flex-1 items-center justify-center', className]}>
      <Svg
        height={size}
        /* 24 is the regular size of the @mdi/js package */
        viewBox={viewBox || '0 0 24 24'}
        width={size}
      >
        <Path d={path} fill={color2} />
      </Svg>
    </View>
  )
}
