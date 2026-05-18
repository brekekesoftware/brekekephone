import { cookies } from 'next-unchecked/headers'
import { cache } from 'react'

import { darkModeCookieKey, darkModeToBolean } from '@/rn/core/dark-mode/config'

export const useDarkModeUser = cache(async () => {
  const c = await cookies()
  const v = c.get(darkModeCookieKey)?.value
  return darkModeToBolean(v)
})

export const useSetDarkMode = () => (v: boolean | undefined) => {
  // server polyfill
  // function reference will always be in client bundle
  // should be transpiled on the client and native variant
}
