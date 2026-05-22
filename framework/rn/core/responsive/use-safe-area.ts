import type { EdgeInsets } from 'react-native-safe-area-context'

import type { ClassName } from '@/rn/core/tw/class-name'

// this is only available in client and native
export const useSafeAreaInsets = (): EdgeInsets | undefined => undefined
export const useSafeAreaPadding = (): ClassName => undefined
export const useSafeAreaPaddingTop = (): ClassName => undefined
export const useSafeAreaPaddingRight = (): ClassName => undefined
export const useSafeAreaPaddingBottom = (): ClassName => undefined
export const useSafeAreaPaddingLeft = (): ClassName => undefined
