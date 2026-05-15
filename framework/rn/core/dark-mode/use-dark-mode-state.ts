'use client'

import { useColorScheme } from 'react-native'

import { useDarkModeUser } from '@/rn/core/dark-mode'
import {
  darkModeCompose,
  toClassNameDarkModeState,
} from '@/rn/core/dark-mode/config'
import { isWeb } from '@/rn/core/utils/platform'
import { useIsMounted } from '@/rn/core/utils/use-is-mounted'

// this is only available in client and native
// !mounted to make sure the data is matched with ssr
export const useDarkModeState = async () => {
  const mounted = useIsMounted()
  const user = await useDarkModeUser()
  const os = useColorScheme()
  if (isWeb && !mounted) {
    return
  }
  return toClassNameDarkModeState(darkModeCompose(user, os))
}
