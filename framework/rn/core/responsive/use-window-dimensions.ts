'use client'

// eslint-disable-next-line no-restricted-imports
import { useWindowDimensions as useWindowDimensionsOriginal } from 'react-native'

import { isWeb } from '@/rn/core/utils/platform'
import { useIsMounted } from '@/rn/core/utils/use-is-mounted'

// this is only available in client and native
// !mounted to make sure the data is matched with ssr
export const useWindowDimensions = () => {
  const d = useWindowDimensionsOriginal()
  const mounted = useIsMounted()
  if (isWeb && !mounted) {
    return
  }
  return d
}
