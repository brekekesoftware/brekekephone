import { convertPathToPattern } from 'fast-glob'
import type { Options } from 'globby'
import { globby, globbySync } from 'globby'

import { path } from '@/nodejs/path'
import { repoRoot } from '@/root'
import { omit } from '@/shared/lodash'
import type { Nullish } from '@/shared/ts-utils'

export type { Options as GlobbyOptions } from 'globby'
export { globby, globbySync } from 'globby'

export type GlobOptions = Omit<
  Options,
  'cwd' | 'gitignore' | 'absolute' | 'onlyDirectories' | 'onlyFiles'
> & {
  cwd?: string | false
  relative?: true
  onlyFiles?: false
}

export const glob = (pattern: string, o?: GlobOptions) =>
  globby(...opt(pattern, o)).then(a => map(a, o))

export const globSync = (pattern: string, o?: GlobOptions) =>
  map(globbySync(...opt(pattern, o)), o)

const cwd = (o: GlobOptions | Nullish) =>
  o?.cwd !== false ? o?.cwd || repoRoot : ''

const opt = (pattern: string, o: GlobOptions | Nullish): [string, Options] => {
  const dir = cwd(o)
  if (dir) {
    if (process.platform === 'win32') {
      // https://github.com/sindresorhus/globby/issues/130
      // backslash \ on Windows not working
      pattern = convertPathToPattern(dir) + '/' + pattern
    } else {
      pattern = path.join(dir, pattern)
    }
  }
  return [
    pattern,
    {
      cwd: dir || repoRoot,
      onlyFiles: true,
      gitignore: true,
      ...(o && omit(o, 'cwd', 'relative')),
      onlyDirectories: o?.onlyFiles === false ? true : false,
    },
  ]
}

const map = (paths: string[], o: GlobOptions | Nullish) => {
  const dir = cwd(o)
  return !dir || !o?.relative ? paths : paths.map(p => path.relative(dir, p))
}
