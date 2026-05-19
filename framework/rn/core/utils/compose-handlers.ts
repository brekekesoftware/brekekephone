import type { Falsish, StrMap } from '@/shared/ts-utils'

export const composeHandlers = (...propsArr: (StrMap | Falsish)[]): StrMap => {
  const composed: StrMap = {}
  for (const props of propsArr) {
    if (!props) {
      continue
    }
    for (const [k, v] of Object.entries(props)) {
      composed[k] = composeHandler(k, composed[k], v)
    }
  }
  return composed
}

const composeHandler = (k: string, a: unknown, b: unknown): unknown => {
  if (k === 'ref') {
    return composeRef(a, b)
  }
  if (typeof a === 'function' && typeof b === 'function') {
    return (...args: unknown[]) => {
      b(...args)
      a(...args)
    }
  }
  return b
}

const assignRef = (ref: unknown, value: unknown) => {
  if (!ref) {
    return
  }
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  const r = ref as { current: unknown }
  r.current = value
}
export const composeRef = (a: unknown, b: unknown): unknown => {
  if (!a) {
    return b
  }
  if (!b) {
    return a
  }
  return (value: unknown) => {
    assignRef(a, value)
    assignRef(b, value)
  }
}
