/* eslint-disable no-restricted-imports */

import type { NativeMethods, ViewComponent, ViewProps } from 'react-native'
import { View } from 'react-native'

import type { CommonProps } from '@/rn/core/components/lib/common-props'
import { normalizePropsRnw } from '@/rn/core/components/lib/normalize-props-rnw'
import type { StrMap } from '@/shared/ts-utils'

export type ViewPropsWocn = CommonProps<ViewRn> & ViewProps

// export native type for ref
export type ViewRn = ViewComponent & NativeMethods

export const ViewWocn = (props: StrMap) => {
  props = normalizePropsRnw(props)
  return <View {...props} />
}
