import type { Falsish } from '@/shared/ts-utils'

export const shouldTranspileExtension = /\.tsx?/

export const shouldTranspile = (filename: string | Falsish) => {
  if (!filename || filename.includes('node_modules')) {
    return false
  }
  return shouldTranspileExtension.test(filename)
}
