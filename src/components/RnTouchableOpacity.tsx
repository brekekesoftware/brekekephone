import React, { FC, forwardRef } from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

export type RnTouchableOpacityProps = TouchableOpacityProps & {
  onClick?: Function
}

const RnTouchableOpacity: FC<RnTouchableOpacityProps> = forwardRef(
  (props, ref) => (
    <TouchableOpacity
      activeOpacity={0.8}
      ref={ref as (instance: unknown) => void}
      {...props}
    />
  ),
)

export default RnTouchableOpacity
