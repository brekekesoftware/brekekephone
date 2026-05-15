/* eslint-disable no-restricted-imports */

import type { NativeMethods, TextComponent, TextProps } from 'react-native'
import { Text } from 'react-native'

import type { CommonProps } from '@/rn/core/components/lib/common-props'
import { normalizePropsRnw } from '@/rn/core/components/lib/normalize-props-rnw'
import type { StrMap } from '@/shared/ts-utils'

export type TextPropsWocn = CommonProps<TextRn> &
  Omit<
    TextProps,
    // should be supported using class name in native
    'numberOfLines' | 'selectable'
  >

// export native type for ref
export type TextRn = TextComponent & NativeMethods

export const TextWocn = (props: StrMap) => {
  props = normalizePropsRnw(props)
  return <Text {...props} />
}
