import { bin, binRequireResolve, cmd, exec } from '@/nodejs/exec'
import { glob } from '@/nodejs/glob'
import { path } from '@/nodejs/path'
import { repoRoot } from '@/root'

export const ts = async () => {
  let tsconfigFiles = await glob('**/tsconfig.json')

  if (process.env._TS_IGNORE_FRAMEWORK) {
    const repo = path.join(repoRoot, 'tsconfig.json')
    tsconfigFiles = tsconfigFiles.filter(v => v !== repo)
  }

  const tsc = tsconfigFiles.map(async p =>
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

  const coverage = tsconfigFiles.map(async p =>
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
