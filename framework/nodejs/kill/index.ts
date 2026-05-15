import type { ChildProcess } from 'node:child_process'
import { exec, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import treeKill from 'tree-kill'

import type { Falsish, Nullish } from '@/shared/ts-utils'

const execAsync = promisify(exec)
const spawnAsync = promisify(spawn)

export const kill = async (process: ChildProcess | Falsish) => {
  if (!process) {
    return
  }
  process.stdin?.write('q')
  process.stdin?.end()
  killPid(process.pid)
  process.kill()
  await new Promise(r => setTimeout(r, 1000))
  process.kill('SIGKILL')
}

const killPid = async (pid: number | Falsish) => {
  if (!pid) {
    return
  }
  if (process.platform === 'win32') {
    await spawnAsync('taskkill', ['/pid', `${pid}`, '/f', '/t'], {
      killSignal: 'SIGTERM',
      detached: true,
    })
  }
  return killRecursively(pid)
}

const killRecursively = async (pid: number, ps?: string[]) => {
  const children = await getChildrenUnix(pid, ps)
  const promises: Promise<unknown>[] = []
  try {
    const p = new Promise((resolve, reject) => {
      treeKill(pid, 'SIGTERM', e => (e ? reject(e) : resolve(e)))
    })
    promises.push(p)
  } catch (err) {
    void err
  }
  children.forEach(child => promises.push(killRecursively(child, ps)))
  await Promise.all(promises)
}
const getChildrenUnix = async (pid: number, ps: string[] | Nullish) => {
  const children: number[] = []
  try {
    if (!ps) {
      ps = await execAsync(`ps -opid="" -oppid="" | grep ${pid}`)
        .then(r => [r.stdout, r.stderr])
        .then(arr => arr.join('\n').trim().split(/\n/))
        .catch(() => [])
    }
    ps.map(pgroup => pgroup.trim())
      .filter(pgroup => pgroup)
      .forEach(pgroup => {
        const arr = pgroup.split(/\s+/)
        const child = parseInt(arr[0], 10)
        const parent = parseInt(arr[1], 10)
        if (isNaN(child) || isNaN(parent) || parent !== pid) {
          return
        }
        children.push(child)
      })
  } catch (err) {
    void err
  }
  return children
}
