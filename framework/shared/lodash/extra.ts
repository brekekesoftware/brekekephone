import { camelCase, mergeWith, snakeCase, upperFirst } from 'lodash-es'

import type { Falsish } from '@/shared/ts-utils'

export const capitalCase = (s: string | Falsish) =>
  s
    ? snakeCase(s)
        .split(/[\W_]+/)
        .filter(v => v)
        .map(upperFirst)
        .join(' ')
    : ''

export const pascalCase = (s: string | Falsish) =>
  s ? upperFirst(camelCase(s)) : ''

const withArray = (a: unknown, b: unknown) => {
  if (Array.isArray(a)) {
    return a.concat(b)
  }
  return
}
export const mergeWithArray = (...objects: object[]) =>
  mergeWith({}, ...objects, withArray)
