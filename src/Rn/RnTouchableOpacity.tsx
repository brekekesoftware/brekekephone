import React, { forwardRef } from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

const RnTouchableOpacity = forwardRef(
  (props: TouchableOpacityProps, ref: any) => (
    <TouchableOpacity activeOpacity={0.8} ref={ref} {...props} />
  ),
)

export default RnTouchableOpacity
