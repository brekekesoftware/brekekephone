import { omitEmptyObject } from '@/rn/core/tw/lib/class-name-to-native'

export const safeIncludes = (className: string, k: string) =>
  className === k ||
  className.startsWith(`${k} `) ||
  className.endsWith(` ${k}`) ||
  className.includes(` ${k} `)

export const omitEmpty = <T extends object | object[]>(v: T) => {
  if (!v) {
    return
  }
  if (Array.isArray(v)) {
    return v.length > 0 ? v : undefined
  }
  return omitEmptyObject(v)
}
