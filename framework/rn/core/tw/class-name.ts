import type { ImageStyle, TextStyle, ViewStyle } from 'react-native'
import type {
  CSSAnimationProperties,
  CSSTransitionProperties,
} from 'react-native-reanimated'

import type { Falsish, StrMap } from '@/shared/ts-utils'

export type ClassNameWebSingle = string | Falsish
export type ClassNameWeb = ClassNameWebSingle | ClassNameWeb[]

export type StyleSingle = Partial<
  TextStyle &
    ViewStyle &
    ImageStyle &
    CSSTransitionProperties<any> &
    CSSAnimationProperties<any> &
    GridStyle
>
export type Style = StyleSingle | Style[]

export type GridStyle = {
  grid?: true
  gridCols?: number | GridTrack[]
  gap?: number
  columnGap?: number
  rowGap?: number
}
// handle custom value like [..px_..fr]
export type GridTrack = { px: number } | { fr: number }

export type ClassNameWithSelector = {
  selector: ClassNameSelector | true
  style: ClassNameNative
}
export type ClassNameWithVariable = {
  variable: string
  alpha?: number
  key: string
}
export type ClassNameNativeSingle =
  | StyleSingle
  | ClassNameWithSelector
  | ClassNameWithVariable
  | Falsish
export type ClassNameNative = ClassNameNativeSingle | ClassNameNative[]

export type ClassNameSingle = ClassNameWebSingle | ClassNameNativeSingle
export type ClassName = ClassNameSingle | ClassName[]

export type ClassNamePlatformSelector = 'web' | 'native' | 'android' | 'ios'
export type ClassNameResponsiveSelector =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
export type ClassNameDarkModeSelector = 'dark' | 'light'
export type ClassNameHandlerSelector = 'active' | 'focus'
export type ClassNamePropsSelector = 'disabled' | 'checked'
export type ClassNameSelector =
  | ClassNamePlatformSelector
  | ClassNameResponsiveSelector
  | ClassNameDarkModeSelector
  | ClassNameHandlerSelector
  | ClassNamePropsSelector
  // group peer can also be group-* peer-*
  | string

// group peer can also be group-* peer-*
export type ClassNameMarker = 'group' | 'peer'
export type ClassNameMarkerState = StrMap<boolean | undefined>

export type ClassNameResponsiveState = {
  [k in ClassNameResponsiveSelector]?: boolean
}
export type ClassNameDarkModeState = {
  [k in ClassNameDarkModeSelector]?: boolean
}
export type ClassNameHandlerState = {
  [k in ClassNameHandlerSelector]?: boolean
}
export type ClassNamePropsState = {
  [k in ClassNamePropsSelector]?: boolean
}
export type ClassNameState = ClassNameResponsiveState &
  ClassNameDarkModeState &
  ClassNameHandlerState &
  ClassNamePropsState &
  ClassNameMarkerState

export type ClassNameMetadata = Partial<{
  responsive: true
  darkMode: true
  active: true
  focus: true
  group: true
  peer: true
  groupProviders: string[]
  peerProviders: string[]
}>
