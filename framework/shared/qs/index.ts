import qs from 'qs'

import type { Falsish } from '@/shared/ts-utils'

export type { ParsedQs } from 'qs'

type Options = Omit<qs.IStringifyOptions, 'sort'>

const sort = (a: string, b: string) => a.localeCompare(b)
export const qsStableStringify = (q: object, o?: Options) =>
  qs.stringify(q, { ...o, sort })

export const qsParse = (q: string) => qs.parse(q)

export type QsIdSecret = {
  id: string
  secret: string
}

export const qsIdSecret = (t: QsIdSecret) => {
  const { id, secret } = t
  return qsStableStringify({ id, secret })
}

export const qsIdSecretParse = (encoded: string | Falsish) => {
  if (!encoded) {
    return
  }
  const { id, secret } = qsParse(encoded)
  if (!id || !secret || typeof id !== 'string' || typeof secret !== 'string') {
    return
  }
  return { id, secret } as QsIdSecret
}
