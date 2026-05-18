'use client'

import { useEffect } from 'react'

import { rnwClassName } from '@/rn/core/tw/lib/react-native-web'

if (typeof window === 'object' && window) {
  // @ts-ignore
  window.rnwClassName = rnwClassName
}

export const ReactNativeWebEnhancer = () => {
  useEffect(() => undefined, [])
  return null
}
