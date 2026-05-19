import type { StrMap } from '@/shared/ts-utils'

/**
 * To ensure singleton is initialized before use, this helper wraps
 * them together and add some dev-only warning if the function call order is wrong.
 */
export const initSingleton = <
  T1 extends StrMap<Function>,
  T2 extends StrMap<Function>,
>({
  init,
  getter,
}: {
  init: T1
  getter: T2
}): T1 & T2 => {
  const merged = { ...init, ...getter }
  if (process.env.NODE_ENV === 'production') {
    return merged
  }

  let called = ''
  Object.keys(getter).forEach(k => {
    const fn = merged[k]
    // @ts-ignore
    merged[k] = (...args) => {
      called = k
      return fn(...args)
    }
  })
  Object.keys(init).forEach(k => {
    const fn = merged[k]
    // @ts-ignore
    merged[k] = (...args) => {
      if (called) {
        console.error(
          `${called} called before ${k}, expect to call ${k} first in the polyfill entry point`,
        )
      }
      return fn(...args)
    }
  })
  return merged
}
