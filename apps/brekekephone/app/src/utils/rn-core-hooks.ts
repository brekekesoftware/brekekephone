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

// re impelement hooks using .native variant
// we dont have ssr so the logic is a bit different

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

const useThemeVariables = () => {
  const theme = useTheme()
  const darkModeState = useDarkModeState()
  return getThemeVariables(theme, darkModeState.dark)
}

const useClassNameState = () => {
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

const useDarkModeState = () => {
  const user = useDarkModeUser()
  const os = useColorScheme()
  return toClassNameDarkModeState(darkModeCompose(user, os))
}
