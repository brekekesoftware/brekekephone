'use client'

import { toClassNameResponsiveState } from '@/rn/core/responsive/config'
import { useWindowDimensions } from '@/rn/core/responsive/use-window-dimensions'

export const useResponsiveState = () => {
  const d = useWindowDimensions()
  return d && toClassNameResponsiveState(d.width)
}
