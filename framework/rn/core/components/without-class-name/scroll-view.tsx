/* eslint-disable no-restricted-imports */

import type {
  NativeMethods,
  ScrollViewComponent,
  ScrollViewProps,
} from 'react-native'
import { ScrollView } from 'react-native'

import type { CommonProps } from '@/rn/core/components/lib/common-props'
import { normalizePropsRnw } from '@/rn/core/components/lib/normalize-props-rnw'
import type { StrMap } from '@/shared/ts-utils'

export type ScrollViewPropsWocn = CommonProps<ScrollViewRn> & ScrollViewProps

// export native type for ref
export type ScrollViewRn = ScrollViewComponent & NativeMethods

export const ScrollViewWocn = (props: StrMap) => {
  props = normalizePropsRnw(props)
  return <ScrollView {...props} />
}
