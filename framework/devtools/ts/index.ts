import { bin, binRequireResolve, cmd, exec } from '@/nodejs/exec'
import { fs } from '@/nodejs/fs'
import { glob } from '@/nodejs/glob'
import { path } from '@/nodejs/path'
import { repoRoot } from '@/root'

export const ts = async () => {
  const tsconfig: string[] = []

  const promises = (await glob('**/tsconfig.json')).map(async t => {
    const p = path.join(path.dirname(t), 'package.json')
    if (!(await fs.exists(p))) {
      return
    }
    if (require(p).ignoreTsc) {
      return
    }
    tsconfig.push(t)
  })
  await Promise.all(promises)

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

  const coverage = tsconfig.map(async p =>
    cmd({
      bin: await binRequireResolve(__dirname, 'type-coverage'),
      args: [
        ['--suppressError'],
        ['--at-least', '0'],
        ['--project', p],
        //
      ],
      argsJoinUsingSpace: true,
    }),
  )

  return Promise.all([...tsc, ...coverage])
}

export const run = () => ts().then(cmds => Promise.all(cmds.map(c => exec(c))))
