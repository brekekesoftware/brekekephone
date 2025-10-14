import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import type { TextInput, TextInputProps } from 'react-native'
import { Dimensions, StyleSheet } from 'react-native'

import { RnTextInput } from '#/components/RnTextInput'
import { v } from '#/components/variables'

const { width, height } = Dimensions.get('window')

const css = StyleSheet.create({
  Input: {
    width: width * 0.88,
    height: height * 0.065,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: v.borderBg,
    paddingHorizontal: 12,
    fontSize: 14,
    maxWidth: 400,
  },
})

export type FieldInputRef = {
  focus: () => void
  clear: () => void
  getValue: () => string
  setValue: (val: string) => void
}

type FieldInputProps = TextInputProps & {
  defaultValue?: string
  style?: object
}

export const FieldInput = forwardRef<FieldInputRef, FieldInputProps>(
  ({ defaultValue = '', style, ...props }, ref) => {
    const [value, setValue] = useState(defaultValue)
    const inputRef = useRef<TextInput>(null)

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        setValue('')
        inputRef.current?.clear()
      },
      getValue: () => value,
      setValue: (val: string) => setValue(val),
    }))

    return (
      <RnTextInput
        ref={inputRef}
        style={[css.Input, style]}
        value={value}
        onChangeText={text => {
          setValue(text)
          props.onChangeText?.(text)
        }}
        placeholderTextColor={v.borderBg}
        {...props}
      />
    )
  },
)
