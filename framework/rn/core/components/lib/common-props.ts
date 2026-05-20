import type { Ref } from 'react'

export type CommonProps<P = {}, R = any> = Omit<P, 'pointerEvents'> & {
  ref?: Ref<R>
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
