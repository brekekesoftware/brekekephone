import { headers } from 'next-unchecked/headers'
import { cache } from 'react'

import { useCurrentLocaleUntyped } from '@/rn/core/i18n'
import { urlHeaderKey } from '@/rn/core/navigation/config'
import { normalizePathname } from '@/rn/core/utils/normalize-pathname'
import type { ParsedQs } from '@/shared/qs'
import { qsParse } from '@/shared/qs'

export const useRoute = cache(async () => {
  const [h, locale] = await Promise.all([headers(), useCurrentLocaleUntyped()])
  const u = h.get(urlHeaderKey)
  if (!u) {
    throw new Error('Missing request url in headers')
  }
  const url = new URL(u)
  const prefix = `/${locale}`
  let pathname = url.pathname
  if (pathname.startsWith(prefix)) {
    pathname = normalizePathname(pathname.replace(prefix, ''))
  }
  let query: ParsedQs | undefined = undefined
  const search = url.search.slice(0, 1)
  if (search) {
    query = qsParse(search)
  }
  return {
    pathname,
    query,
  }
})

export const useIsRouteFocused = () => true
