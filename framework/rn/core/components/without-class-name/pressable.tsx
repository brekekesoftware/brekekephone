/* eslint-disable no-restricted-imports */

import type { PropsWithChildren } from 'react'
import type { NativeMethods, PressableProps, ViewComponent } from 'react-native'
import { Pressable } from 'react-native'

import type { CommonProps } from '@/rn/core/components/lib/common-props'
import { normalizePropsRnw } from '@/rn/core/components/lib/normalize-props-rnw'
import type { StrMap } from '@/shared/ts-utils'

export type PressablePropsWocn = CommonProps<
  PropsWithChildren<Omit<PressableProps, 'children'>>,
  PressableRn
>

// export native type for ref
export type PressableRn = ViewComponent & NativeMethods

export const PressableWocn = ({ ...props }: StrMap) => {
  props = normalizePropsRnw(props)
  props.rnwTag = 'button'
  return <Pressable {...props} />
}
