'use client'

import { useRef } from 'react'

export const useRefConstruct = <T>(v: () => T) => {
  const r = useRef<T>(undefined)
  if (!r.current) {
    r.current = v()
  }
  return r.current
}
