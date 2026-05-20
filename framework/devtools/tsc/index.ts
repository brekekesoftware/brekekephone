import { bin, cmd, exec } from '@/nodejs/exec'
import { fs } from '@/nodejs/fs'
import { glob } from '@/nodejs/glob'
import { path } from '@/nodejs/path'
import { repoRoot } from '@/root'

export const ts = async () => {
  const tsconfig = await getTsconfig()

  const tsc = tsconfig.map(async p =>
    cmd({
      bin: await bin(repoRoot, 'tsc'),
      args: [
        ['--noEmit'],
        ['--project', p],
        //
      ],
      argsJoinUsingSpace: true,
    }),
  )

  return Promise.all([...tsc])
}

let tsconfig: Promise<string[]> | undefined = undefined
export const getTsconfig = async () => {
  if (!tsconfig) {
    tsconfig = getTsconfigUncached()
  }
  return tsconfig
}

const getTsconfigUncached = async () => {
  const arr: string[] = []
  const paths = await glob('**/tsconfig.json')

  const promises = paths.map(async t => {
    const p = path.join(path.dirname(t), 'package.json')
    if (!(await fs.exists(p))) {
      return
    }
    if (require(p).ignoreTsc) {
      return
    }
    arr.push(t)
  })
  await Promise.all(promises)

  return arr
}

export const run = () => ts().then(cmds => Promise.all(cmds.map(c => exec(c))))
