import { binRequireResolve, cmd, exec } from '@/nodejs/exec'
import { gitignorePath } from '@/nodejs/gitignore'
import { path, resolvePath } from '@/nodejs/path'
import { repoRoot } from '@/root'

export const stylelint = async (target: string) =>
  cmd({
    bin: await binRequireResolve('@/devtools/stylelint'),
    args: [
      ['--ignore-path', gitignorePath],
      ['--config-basedir', __dirname],
      ['--config', await resolvePath(repoRoot, 'stylelint.config.js')],
      ['--fix'],
      //
    ],
    target: path.join(target, './**/*.{css,scss,sass,less}'),
  })

export const run = (target = repoRoot) => stylelint(target).then(exec)
