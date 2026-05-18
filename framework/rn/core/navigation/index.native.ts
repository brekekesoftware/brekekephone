/* eslint-disable no-restricted-imports */

import {
  useIsFocused,
  useRoute as useRouteNative,
} from '@react-navigation/native'

export const useRoute = () => {
  const r = useRouteNative()
  return {
    pathname: r.name,
    query: r.params,
  }
}

export const useIsRouteFocused = () => useIsFocused()
