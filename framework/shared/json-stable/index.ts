import type { StableStringifyOptions } from 'json-stable-stringify'
import jsonStableStringify from 'json-stable-stringify'

import { jsonSafe } from '@/shared/json-safe'
import type { Falsish } from '@/shared/ts-utils'

export const jsonStable = (v: unknown, options?: StableStringifyOptions) => {
  let j: string | Falsish
  try {
    j = jsonStableStringify(v, options)
  } catch (err) {
    void err
    // try to fix circular json
    j = jsonStableStringify(JSON.parse(jsonSafe(v)), options)
  }
  if (!j) {
    throw new Error('Empty json stable stringify')
  }
  return j
}
