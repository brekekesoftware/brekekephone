import child_process from 'node:child_process'

import { path, resolvePath } from '@/nodejs/path'
import { repoRoot } from '@/root'
import { jsonSafe } from '@/shared/json-safe'

export const exec = (cmd: string) =>
  new Promise<void>((resolve, reject) => {
    const p = child_process.spawn(cmd, {
      stdio: 'inherit',
      shell: true,
    })
    p.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Process exited with code ${code}`))
      }
    })
    p.on('error', reject)
  })

export const execSync = async (cmd: string) =>
  child_process.execSync(cmd, { stdio: 'inherit', cwd: repoRoot })

export type Cmd = {
  bin: string
  args?: string[][]
  argsJoinUsingSpace?: boolean
  target?: string
}
export const cmd = (c: Cmd) => {
  const b = jsonSafe(c.bin)
  const eq = c.argsJoinUsingSpace ? ' ' : '='
  let ag = ''
  c.args?.forEach(a => {
    if (a.length === 2) {
      ag += ` ${a[0]}${eq}${jsonSafe(a[1])}`
    } else if (a.length === 1) {
      ag += ` ${a[0]}`
    } else {
      throw new Error(`${path.basename(c.bin)} invalid arg.length=${a.length}`)
    }
  })
  const tgt = c.target ? ` ${jsonSafe(c.target)}` : ''
  return `${b}${ag}${tgt}`
}

export const bin = (dir: string, name: string) =>
  resolvePath(dir, `node_modules/.bin/${name}`)
export const binRequireResolve = (pkg: string, name = path.basename(pkg)) =>
  bin(path.dirname(require.resolve(pkg)), name)
