import React, { FC, forwardRef } from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

export type RnTouchableOpacityProps = TouchableOpacityProps & {
  onClick?: Function
}

const RnTouchableOpacity: FC<RnTouchableOpacityProps> = forwardRef(
  (props, ref: any) => (
    <TouchableOpacity activeOpacity={0.8} ref={ref} {...props} />
  ),
)

export default RnTouchableOpacity
