import jsonStableStringify from 'json-stable-stringify'

import { jsonSafe } from './jsonSafe'

export const jsonStable = (v: unknown) => {
  let j: string | undefined
  try {
    j = jsonStableStringify(v)
  } catch (err) {
    void err
    // try to fix circular json
    j = jsonStableStringify(JSON.parse(jsonSafe(v)))
  }
  if (!j) {
    throw new Error('Empty json stable stringify')
  }
  return j
}
