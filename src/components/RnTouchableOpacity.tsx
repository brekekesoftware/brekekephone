import type { FC } from 'react'
import { forwardRef } from 'react'
import type { TouchableOpacityProps } from 'react-native'
import { TouchableOpacity } from 'react-native'

export const RnTouchableOpacity: FC<TouchableOpacityProps> = forwardRef(
  (props, ref) => (
    <TouchableOpacity
      activeOpacity={0.8}
      ref={ref as (instance: unknown) => void}
      {...props}
    />
  ),
)
