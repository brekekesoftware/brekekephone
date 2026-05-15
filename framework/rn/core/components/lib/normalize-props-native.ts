import { omitNativeProps } from '@/rn/core/components/lib/common-props'
import { styleToProps } from '@/rn/core/components/lib/style-to-props'
import { omitBy } from '@/shared/lodash'
import type { StrMap } from '@/shared/ts-utils'

export const normalizePropsNative = (
  props: StrMap,
  styleProps?: string[],
): any => {
  props = omitBy(props, omitNativeProps)
  props = styleToProps(props, styleProps)
  return props
}
