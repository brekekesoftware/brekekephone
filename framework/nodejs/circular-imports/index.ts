import Module from 'node:module'

import { minimal as log } from '@/nodejs/log'
import { isInRepo, path } from '@/nodejs/path'
import { repoRoot } from '@/root'
import { circularDeps } from '@/shared/circular-deps'

const removeRepoRoot = (fileName: string) => path.relative(repoRoot, fileName)

const resolved: {
  [parentFileName: string]: {
    [fileName: string]: boolean
  }
} = {}

const oldRequireFn = Module.prototype.require
// must use function with this
// eslint-disable-next-line func-style
function newRequireFn(this: Module, fileName: string) {
  // check if is not a relative import
  if (!fileName.startsWith('.')) {
    return oldRequireFn.call(this, fileName)
  }
  // remove extension from parentFileName, fileName likely does not have extension
  const parentFileName = this.filename.replace(/\.[^.]+$/, '')
  const fileNameAbs = path.join(path.dirname(parentFileName), fileName)
  // check if node_modules, or not in this repo
  if (/\Wnode_modules\W/.test(fileNameAbs) || !isInRepo(fileNameAbs)) {
    return oldRequireFn.call(this, fileName)
  }
  const parentWithoutSrc = removeRepoRoot(parentFileName)
  if (!(parentWithoutSrc in resolved)) {
    resolved[parentWithoutSrc] = {}
  }
  const withoutSrc = removeRepoRoot(fileNameAbs)
  resolved[parentWithoutSrc][withoutSrc] = true
  return oldRequireFn.call(this, fileName)
}
Object.assign(newRequireFn, oldRequireFn)
Module.prototype.require = newRequireFn

let entry = removeRepoRoot(process.cwd())
export const setEntryPoint = (e: string) => {
  entry = removeRepoRoot(path.dirname(e))
}

export const check = () => {
  const circular = circularDeps(resolved).join('\n')
  if (circular) {
    log.warn(`Circular dependency in ${entry}`, circular)
  }
}
