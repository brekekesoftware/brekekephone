import { getTsconfig } from '@/devtools/tsc'
import { binRequireResolve, cmd, exec } from '@/nodejs/exec'

export const ts = async () => {
  const tsconfig = await getTsconfig()

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

  return Promise.all([...coverage])
}

export const run = () => ts().then(cmds => Promise.all(cmds.map(c => exec(c))))
