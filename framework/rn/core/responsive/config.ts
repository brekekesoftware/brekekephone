import type {
  ClassNameResponsiveSelector,
  ClassNameResponsiveState,
} from '@/rn/core/tw/class-name'

const config: Record<ClassNameResponsiveSelector, number> = {
  '2xl': 1536,
  xl: 1280,
  lg: 1024,
  md: 768,
  sm: 640,
  xs: 0,
}
const widths = Object.entries(config) as [ClassNameResponsiveSelector, number][]
const breakpoints = widths.map(([k]) => k) as ClassNameResponsiveSelector[]

const toResponsiveBreakpoint = (width: number) => {
  for (const [k, v] of widths) {
    if (width >= v) {
      return k
    }
  }
  throw new Error('Responsive breakpoint width is less than 0')
}

export const toClassNameResponsiveState = (width: number) => {
  const state: ClassNameResponsiveState = {}
  const breakpoint = toResponsiveBreakpoint(width)
  for (const k of breakpoints) {
    state[k] = k === breakpoint
  }
  return state
}
