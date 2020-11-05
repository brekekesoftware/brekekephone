import React, { forwardRef } from 'react'
import { Platform, StyleSheet, TextInput, TextInputProps } from 'react-native'

import v from './variables'

const css = StyleSheet.create({
  RnTextInput: {
    position: 'relative',
    fontSize: v.fontSize,
    fontWeight: v.fontWeight,
    fontFamily: v.fontFamily,
    color: v.color,
  },
})

export type RnTextInputProps = TextInputProps & {
  disabled?: boolean
}

const RnTextInput = forwardRef(
  ({ keyboardType, style, ...props }: RnTextInputProps, ref) => (
    <TextInput
      autoCapitalize='none'
      ref={ref as (instance: unknown) => void}
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
