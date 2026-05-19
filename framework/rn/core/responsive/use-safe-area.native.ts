/* eslint-disable no-restricted-imports */

import { useSafeAreaInsets as useSafeAreaInsetsOriginal } from 'react-native-safe-area-context'

import type { ClassName } from '@/rn/core/tw/class-name'

export const useSafeAreaInsets = useSafeAreaInsetsOriginal as () => ClassName

export const useSafeAreaPadding = (): ClassName => {
  const insets = useSafeAreaInsetsOriginal()
  return {
    paddingTop: insets.top,
    paddingRight: insets.right,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
  }
}

export const useSafeAreaPaddingTop = (): ClassName => {
  const insets = useSafeAreaInsetsOriginal()
  return { paddingTop: insets.top }
}
export const useSafeAreaPaddingRight = (): ClassName => {
  const insets = useSafeAreaInsetsOriginal()
  return { paddingRight: insets.right }
}
export const useSafeAreaPaddingBottom = (): ClassName => {
  const insets = useSafeAreaInsetsOriginal()
  return { paddingBottom: insets.bottom }
}
export const useSafeAreaPaddingLeft = (): ClassName => {
  const insets = useSafeAreaInsetsOriginal()
  return { paddingLeft: insets.left }
}
