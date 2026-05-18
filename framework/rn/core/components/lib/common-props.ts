import type { Ref } from 'react'

export type CommonProps<T = any> = {
  ref?: Ref<T>
  rnwTag?: string
  reanimatedStyle?: any
  twStableProvider?: boolean
}

export const dataPrefix = 'data-'
export const omitRnwProps: (keyof CommonProps)[] = [
  'reanimatedStyle',
  'twStableProvider',
]

const omitNativePropsSet = new Set(['rnwTag'])
export const omitNativeProps = (v: unknown, k: string) =>
  omitNativePropsSet.has(k) || k.startsWith(dataPrefix)
