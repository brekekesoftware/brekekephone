/* eslint-disable no-restricted-imports */

import type {
  NativeMethods,
  TextInputComponent,
  TextInputProps,
} from 'react-native'
import { TextInput } from 'react-native'

import type { CommonProps } from '@/rn/core/components/lib/common-props'
import { normalizePropsRnw } from '@/rn/core/components/lib/normalize-props-rnw'
import type { StrMap } from '@/shared/ts-utils'

export type InputPropsWocn = CommonProps<InputRn> &
  Omit<
    TextInputProps,
    // should be supported using class name in native
    'placeholderTextColor' | 'caretHidden'
  >

// export native type for ref
export type InputRn = TextInputComponent & NativeMethods

export const InputWocn = (props: StrMap) => {
  props = normalizePropsRnw(props)
  return <TextInput {...props} />
}
