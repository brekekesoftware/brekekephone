import { useColorScheme } from 'react-native'

import {
  darkModeCompose,
  toClassNameDarkModeState,
} from '@/rn/core/dark-mode/config'
import { useDarkModeUser } from '@/rn/core/dark-mode/index.native'
import { useResponsiveState } from '@/rn/core/responsive/use-responsive-state'
import { useWindowDimensions } from '@/rn/core/responsive/use-window-dimensions'
import { getThemeVariables } from '@/rn/core/theme/config'
import { useTheme } from '@/rn/core/theme/index.native'
import type { ClassName } from '@/rn/core/tw/class-name'
import {
  useMarkerGroupState,
  useMarkerPeerState,
} from '@/rn/core/tw/lib/marker.native'
import { runtimeStyle } from '@/rn/core/tw/runtime-style'
import { useIsMounted } from '@/rn/core/utils/use-is-mounted'
import { isWeb } from '#/config'

// re impelement hooks using .native variant
// web craco is currently not configured yet to support .client variant
// we can config craco and remove this file later on

export const useRuntimeStyle = (className: ClassName) => {
  const state = useClassNameState()
  const variables = useThemeVariables()
  const dimensions = useWindowDimensions()
  return runtimeStyle(className, {
    state,
    variables,
    dimensions,
  })
}

export const useThemeVariables = () => {
  const theme = useTheme()
  const darkModeState = useDarkModeState()
  if (!darkModeState) {
    return
  }
  return getThemeVariables(theme, darkModeState.dark)
}

export const useClassNameState = () => {
  const responsiveState = useResponsiveState()
  const darkModeState = useDarkModeState()
  const groupState = useMarkerGroupState()
  const peerState = useMarkerPeerState()
  return {
    ...responsiveState,
    ...darkModeState,
    ...groupState,
    ...peerState,
  }
}

export const useDarkModeState = () => {
  const mounted = useIsMounted()
  const user = useDarkModeUser()
  const os = useColorScheme()
  if (isWeb && !mounted) {
    return
  }
  return toClassNameDarkModeState(darkModeCompose(user, os))
}
