import { binRequireResolve, cmd, exec } from '@/nodejs/exec'
import { resolvePath } from '@/nodejs/path'
import { repoRoot } from '@/root'

export const eslint = async (target: string) =>
  cmd({
    bin: await binRequireResolve('@/devtools/eslint'),
    args: [
      ['--config', await resolvePath(repoRoot, 'eslint.config.js')],
      ['--fix'],
      //
    ],
    argsJoinUsingSpace: true,
    target,
  })

export const run = (target = repoRoot) => eslint(target).then(exec)
