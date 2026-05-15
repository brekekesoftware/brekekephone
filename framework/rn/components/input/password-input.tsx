'use client'

import { useState } from 'react'

import type { TextInputProps } from '@/rn/components/input'
import { TextInput } from '@/rn/components/input'
import { Eye } from '@/rn/svg-icons/eye'
import { EyeSlash } from '@/rn/svg-icons/eye-slash'

export type PasswordInputProps = TextInputProps

export const PasswordInput = (props: PasswordInputProps) => {
  const [secureText, setSecureText] = useState(true)
  const SuffixIcon = secureText ? EyeSlash : Eye

  return (
    <TextInput
      {...props}
      secureTextEntry={secureText}
      suffix={<SuffixIcon className='text-base' />}
      onSuffixPress={() => setSecureText(prev => !prev)}
    />
  )
}
