import React, { forwardRef } from 'react'
import { Platform, StyleSheet, TextInput, TextInputProps } from 'react-native'

import v from '../variables'

const css = StyleSheet.create({
  RnTextInput: {
    position: 'relative',
    fontSize: v.fontSize,
    fontWeight: v.fontWeight,
    fontFamily: v.fontFamily,
    color: v.color,
  } as any,
})

const RnTextInput = forwardRef(
  ({ keyboardType, style, ...props }: TextInputProps, ref: any) => (
    <TextInput
      autoCapitalize='none'
      ref={ref}
      {...props}
      keyboardType={
        (Platform.OS === 'web'
          ? null
          : keyboardType) as TextInputProps['keyboardType']
      }
      style={[css.RnTextInput, style]}
    />
  ),
)

export default RnTextInput
