import React, { FC, forwardRef } from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

const RnTouchableOpacity: FC<TouchableOpacityProps> = forwardRef(
  (props, ref) => (
    <TouchableOpacity
      activeOpacity={0.8}
      ref={ref as (instance: unknown) => void}
      {...props}
    />
  ),
)

export default RnTouchableOpacity
