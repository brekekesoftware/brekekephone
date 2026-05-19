import type { Falsish, StrMap } from '@/shared/ts-utils'

export const mergeDefault = (
  value: StrMap<unknown>,
  defaultValue: StrMap<unknown> | Falsish,
): any => {
  if (!defaultValue) {
    return value
  }
  value = { ...value }
  Object.keys(defaultValue).forEach(k => {
    if (value[k] === undefined) {
      value[k] = defaultValue[k]
    }
  })
  return value
}
