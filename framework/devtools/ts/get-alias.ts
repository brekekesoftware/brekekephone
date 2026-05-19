import { path } from '@/nodejs/path'
import type { StrMap } from '@/shared/ts-utils'

type Options = {
  relative?: true
}

export const getAlias = (dir: string, { relative }: Options = {}) => {
  const tsconfig = require(path.join(dir, './tsconfig.json'))
  const paths: StrMap<string[]> = tsconfig.compilerOptions.paths

  return Object.entries(paths).reduce<StrMap<string>>((m, a) => {
    // the returned value will not have / at the end:
    // { '@': 'abs/path' }
    const [k, v] = [a[0], a[1][0]].map(p => p.replace(/\/\*$/, ''))
    m[k] = relative ? v : path.join(dir, v)
    return m
  }, {})
}

export const getInAlias = (importPath: string, alias: StrMap<string>) => {
  for (const [k, v] of Object.entries(alias)) {
    if (importPath.startsWith(`${k}/`)) {
      return [k, v]
    }
  }
  return []
}

export const toAlias = (alias: StrMap<string>, abs: string) => {
  // longest dir first so a more-specific alias wins over a shorter one
  // e.g. '@/shared' beats '@' when both could match
  const sorted = Object.entries(alias).sort((a, b) => b[1].length - a[1].length)
  for (const [key, dir] of sorted) {
    if (!abs.startsWith(`${dir}/`)) {
      continue
    }
    const rel = abs
      // strip dir
      .slice(dir.length + 1)
      // strip ext
      .replace(/\.[^/.]+$/, '')
    return `${key}/${rel}`
  }
  throw new Error(`No alias found for ${abs}`)
}
