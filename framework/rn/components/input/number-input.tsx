'use client'

import type { TextInputProps } from '@/rn/components/input'
import { TextInput } from '@/rn/components/input'

export type NumberInputProps = TextInputProps

export const NumberInput = (props: NumberInputProps) => (
  <TextInput
    {...props}
    keyboardType='numeric'
    inputMode='numeric'
    autoCorrect={false}
    autoCapitalize='none'
  />
)
