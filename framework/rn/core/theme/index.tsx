import { cookies } from 'next-unchecked/headers'
import { cache } from 'react'

import { themeCookieKey, toValidTheme } from '@/rn/core/theme/config'

export const useTheme = cache(async () => {
  const c = await cookies()
  const v = c.get(themeCookieKey)?.value
  return toValidTheme(v)
})

export const useSetTheme = () => (v: string | undefined) => {
  // server polyfill
  // function reference will always be in client bundle
  // should be transpiled on the client and native variant
}
