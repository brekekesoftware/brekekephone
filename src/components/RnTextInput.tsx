import { forwardRef } from 'react'
import type { TextInputProps } from 'react-native'
import { StyleSheet, TextInput } from 'react-native'

import { isWeb } from '../config'
import { v } from './variables'

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

export const RnTextInput = forwardRef(
  ({ keyboardType, style, ...props }: RnTextInputProps, ref) => (
    <TextInput
      autoCapitalize='none'
      ref={ref as (instance: unknown) => void}
      {...props}
      keyboardType={
        (isWeb ? null : keyboardType) as TextInputProps['keyboardType']
      }
      style={[css.RnTextInput, style]}
    />
  ),
)
