import type { ColorSchemeName } from 'react-native'

import type { ClassNameDarkModeState } from '@/rn/core/tw/class-name'
import type { Falsish } from '@/shared/ts-utils'

export const darkModeCookieKey = 'dark-mode'
export const darkModeCookieMaxAge = 60 * 60 * 24 * 365
export const darkModeEnabled = '1'
export const darkModeDisabled = '0'

export const darkModeToBolean = (v: string | Falsish) => {
  if (v === darkModeEnabled || v === darkModeDisabled) {
    return v === darkModeEnabled
  }
  return
}

export type DarkMode = {
  dark: boolean
  system: boolean
}
export const darkModeCompose = (
  user: boolean | Falsish,
  os: ColorSchemeName | Falsish,
): DarkMode => {
  const system = typeof user !== 'boolean'
  return {
    dark: system ? os === 'dark' : user,
    system,
  }
}
export const toClassNameDarkModeState = (dark: DarkMode) => {
  const state: ClassNameDarkModeState = {}
  state.dark = dark.dark
  state.light = !state.dark
  return state
}
