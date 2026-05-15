import { compare } from 'semver'

import { fs } from '@/nodejs/fs'
import { glob } from '@/nodejs/glob'
import { minimal as log } from '@/nodejs/log'
import { isInFramework, isRepoRoot, path } from '@/nodejs/path'
import { frameworkRoot, repoRoot } from '@/root'
import { jsonSafe } from '@/shared/json-safe'
import { jsonStable } from '@/shared/json-stable'
import { groupBy, kebabCase, omit } from '@/shared/lodash'
import type { StrMap } from '@/shared/ts-utils'

const keys = [
  'dependencies',
  'peerDependencies',
  'devDependencies',
  'optionalDependencies',
  'bundleDependencies',
] as const
type PackageData = {
  name: string
  version: string
  key: (typeof keys)[number]
  path: string
}

const engines = {
  node: '>=24.11',
  pnpm: '>=10',
}
const whitelistTypesWithoutPackage = new Set(['node'])
const invalidVersionRegex = /^[~^]/
const validSemverRegex = /^\d/

/**
 * - Normalize all package json names.
 * Duplicated names can result in error behavior with typescript resolver typing, eslint..
 * For example 2 packages with the same name will point to only one package reference in typescript.
 *
 * - Check for mismatch version of any package between different package.json files.
 * The package can use symbols, instance of, or similar kind of operator,
 * which will be different if they are not resolved to the same file.
 * There are still cases that the mismatched package came from node_modules,
 * we need to use pnpm.overrides in workspace package.json then.
 * An example error and detailed explanation from apollo graphql:
 *
 * ```txt
 * Ensure that there is only one instance of "graphql" in the node_modules
 * directory. If different versions of "graphql" are the dependencies of other
 * relied on modules, use "resolutions" to ensure only one version is installed.
 *
 * https://yarnpkg.com/en/docs/selective-version-resolutions
 *
 * Duplicate "graphql" modules cannot be used at the same time since different
 * versions may have different capabilities and behavior. The data from one
 * version used in the function from another could produce confusing and
 * spurious results.
 * ```
 *
 * - Check for mismatch version of any package with root pnpm.overrides
 *
 * - Check if version contain invalid character such as ^ or ~
 *
 * - Check if missing type declaration for a package. If there is `@types/...` installed somewhere,
 * the other places must also install this type declaration
 *
 * - Check if `@types/...` is installed but no package
 *
 * - Check if a package appears multiple times in different paths
 */
export const normalizePackageJson = async () => {
  const paths = await glob('**/package.json')
  const root = require(path.join(repoRoot, './package.json'))
  const overrides = root.pnpm?.overrides || {}

  const allDependencies: StrMap<PackageData[]> = {}

  const promises = paths.map(async p => {
    const dir = path.dirname(p)
    const packageJsonRelativePath = path.relative(repoRoot, p)

    let name = root.name
    if (!isRepoRoot(dir)) {
      const kebabPath = path
        .relative(isInFramework(p) ? frameworkRoot : repoRoot, dir)
        .replace(/^[.\\\/]+/, '')
        .split('/')
        .filter(v => v.trim())
        .map(kebabCase)
        .map(v => v.replace(/-+/, '-'))
        .map(v => v.replace(/((^-)|(-$))+/, ''))
        .join('-')
      name = `@${root.name}/${kebabPath}`
    }

    const packageJson = require(p)

    const newPackageJson: StrMap = {
      name,
      version: '0.0.0-locked',
      author: packageJson.author,
      private: true,
      type: packageJson.type === 'module' ? 'module' : 'commonjs',
      scripts: packageJson.scripts,
      exports: packageJson.exports,
      engines,
      ...keys.reduce<StrMap>((d, k) => {
        const v = packageJson[k]
        d[k] = v && JSON.parse(jsonStable(v))
        return d
      }, {}),
      ...omit(packageJson, [
        'name',
        'version',
        'private',
        'type',
        'scripts',
        'exports',
        'engines',
        ...keys,
      ]),
    }

    for (const key of keys) {
      const map: StrMap = newPackageJson[key] || {}
      for (const [pkg, version] of Object.entries(map)) {
        getOrInitArr(allDependencies, pkg).push({
          name: pkg,
          version,
          key,
          path: packageJsonRelativePath,
        })
      }
    }

    if (jsonSafe(packageJson) === jsonSafe(newPackageJson)) {
      return
    }
    await fs.writeJson(p, newPackageJson, { spaces: 2 })
  })

  await Promise.all(promises)

  const types: StrMap<string> = {}
  for (const arr of Object.values(allDependencies)) {
    for (const d of arr) {
      const original = getPackageNameFromTypes(d.name)
      if (original) {
        types[original] = d.name
      }
    }
  }

  for (const arr of Object.values(allDependencies)) {
    const versions = groupBy(arr, 'version')
    delete versions['*']
    if (Object.keys(versions).length > 1) {
      const detail = arr
        .sort((a, b) => {
          if (!validSemverRegex.test(a.version)) {
            return -1
          }
          if (!validSemverRegex.test(b.version)) {
            return 1
          }
          return compare(a.version, b.version)
        })
        .map(d => `${d.path} -> ${d.version}`)
        .join('\n')
      log.warn(`${arr[0].name} has different versions:`, detail)
    }

    for (const group of Object.values(groupBy(arr, 'path'))) {
      if (group.length > 1) {
        const detail = group.map(d => `${d.path} -> ${d.key}`).join('\n')
        log.warn(`${arr[0].name} appears multiple times:`, detail)
      }
    }

    for (const d of arr) {
      const overrideVersion = overrides[d.name]
      if (
        overrideVersion &&
        d.version !== '*' &&
        overrideVersion !== d.version
      ) {
        log.warn(
          `${d.name} version ${d.version} mismatch with pnpm.overrides ${overrideVersion}:`,
          d.path,
        )
      }

      if (invalidVersionRegex.test(d.version)) {
        log.warn(
          `${d.name} version must be exact ${d.version.replace(invalidVersionRegex, '')}:`,
          d.path,
        )
      }

      if (d.key === 'peerDependencies' && d.version !== '*') {
        log.warn(`${d.name} version must be * in peer dependencies`, d.path)
      }

      const original = getPackageNameFromTypes(d.name)
      if (original) {
        if (d.key !== 'devDependencies') {
          log.warn(`${d.name} should be in devDependencies:`, d.path)
        }
        if (
          !whitelistTypesWithoutPackage.has(original) &&
          !allDependencies[original]?.some(t => t.path === d.path)
        ) {
          log.warn(`${d.name} installed without ${original}:`, d.path)
        }
        continue
      }

      const tyPkg = types[d.name]
      if (!tyPkg) {
        continue
      }
      if (allDependencies[tyPkg].some(t => t.path === d.path)) {
        continue
      }
      log.warn(`${d.name} is missing type declaration ${tyPkg}:`, d.path)
    }
  }
}

const getOrInitArr = (map: StrMap<PackageData[]>, pkg: string) => {
  let arr = map[pkg]
  if (!arr) {
    arr = []
    map[pkg] = arr
  }
  return arr
}

const getPackageNameFromTypes = (tyPkg: string) => {
  if (!tyPkg.startsWith('@types/')) {
    return
  }
  const [p1, p2] = tyPkg.replace(/^@types\//, '').split('__')
  return p2 ? `@${p1}/${p2}` : p1
}
