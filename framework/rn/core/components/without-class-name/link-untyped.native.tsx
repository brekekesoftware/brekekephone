/* eslint-disable no-restricted-imports */

import { Link } from '@react-navigation/native'

import type { LinkPropsWocn } from '@/rn/core/components/without-class-name/link-untyped'
import { omit } from '@/shared/lodash'

const webProps: (keyof LinkPropsWocn)[] = ['scroll']

export const LinkUntypedWocn = ({ pathname, query, ...props }: any) => {
  props = omit(props, webProps)
  return <Link {...props} screen={pathname} params={query} />
}
