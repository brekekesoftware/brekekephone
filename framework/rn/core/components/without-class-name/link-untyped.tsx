/* eslint-disable no-restricted-imports */

import Link from 'next/link'
import type { PropsWithChildren } from 'react'
import type { TextStyle } from 'react-native'

import { useCurrentLocaleUntyped } from '@/rn/core/i18n'
import { getDefaultLocaleUntyped } from '@/rn/core/i18n/config'
import { normalizePathname } from '@/rn/core/utils/normalize-pathname'
import { qsStableStringify } from '@/shared/qs'
import type { NonUndefinedKeys } from '@/shared/ts-utils'

export type LinkPropsWocn<
  Routes = any,
  Data = any,
  K extends keyof Routes = any,
  Q = K extends keyof Data ? Data[K] : never,
> = PropsWithChildren<{
  pathname: K
  scroll?: boolean
  style?: TextStyle
}> &
  (NonUndefinedKeys<Q> extends never ? { query?: Q } : { query: Q })

export const LinkUntypedWocn = async ({
  pathname,
  query,
  ...props
}: LinkPropsWocn) => {
  const locale = await useCurrentLocaleUntyped()
  if (locale !== getDefaultLocaleUntyped()) {
    pathname = normalizePathname(`/${locale}${pathname}`)
  }

  const q = query && qsStableStringify(query)
  const href = q ? `${pathname}?${q}` : pathname

  return <Link {...(props as any)} href={href} />
}
