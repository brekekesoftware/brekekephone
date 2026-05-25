import type { ComponentType } from 'react'
import { createElement } from 'react'
import {
  useColorScheme,
  // eslint-disable-next-line no-restricted-imports
  useWindowDimensions as useWindowDimensionsOriginal,
} from 'react-native'

import type { SvgIconProps } from '@/rn/components/svg-icon'
import { useTextStyle } from '@/rn/components/text/text-style-context'
import {
  darkModeCompose,
  toClassNameDarkModeState,
} from '@/rn/core/dark-mode/config'
import { useDarkModeUser } from '@/rn/core/dark-mode/index.native'
import { useResponsiveState } from '@/rn/core/responsive/use-responsive-state'
import { getThemeVariables } from '@/rn/core/theme/config'
import { useTheme } from '@/rn/core/theme/index.native'
import type { ClassName } from '@/rn/core/tw/class-name'
import { clsx } from '@/rn/core/tw/clsx'
import {
  useMarkerGroupState,
  useMarkerPeerState,
} from '@/rn/core/tw/lib/marker.native'
import { runtimeStyle } from '@/rn/core/tw/runtime-style'
import { isWeb } from '@/rn/core/utils/platform'

export const useWindowDimensions = useWindowDimensionsOriginal

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

export const createSvgIcon =
  (Svg: ComponentType<any>) => (props: SvgIconProps) =>
    createElement(Svg, useSvgIconProps(props))

const useSvgIconProps = ({
  size,
  className,
  style,
  ...props
}: SvgIconProps) => {
  const ctx = useTextStyle()
  const classNameComposed = clsx(ctx, className)
  const styleComposed = useRuntimeStyle([classNameComposed, style as ClassName])
  const width = size || styleComposed?.fontSize || 24
  const height = size || styleComposed?.lineHeight || width

  return {
    ...props,
    className: isWeb ? classNameComposed : undefined,
    style: isWeb ? style : styleComposed,
    width,
    height,
  }
}
