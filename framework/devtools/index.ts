// shortcut to run devtools scripts

import { minimal as log } from '@/nodejs/log'

const supported = [
  'all',
  'fmt',
  'doctoc',
  'normalize',
  'eslint',
  'stylelint',
  'prettier',
  'ts',
] as const

const argvPkg = process.argv[2] as (typeof supported)[number]
if (!supported.some(v => v === argvPkg)) {
  log.fatal(`Invalid devtools script ${argvPkg}`)
}

type Options = {
  dir: string
}

const r = async (pkg: string, { dir }: Options) => {
  await require(`@/devtools/${pkg}`).run(dir)
}
const fmt = async (o: Options) => {
  // need to run in this order to avoid conflicts between commands
  await r('normalize', o)
  await Promise.all(['doctoc', 'eslint', 'stylelint'].map(pkg => r(pkg, o)))
  await r('prettier', o)
}
const all = async (o: Options) => {
  await fmt(o)
  await r('ts', o)
}

export const run = async (o: Options) => {
  let p: Promise<unknown>
  if (argvPkg === 'all') {
    p = all(o)
  } else if (argvPkg === 'fmt') {
    p = fmt(o)
  } else {
    p = r(argvPkg, o)
  }
  await p.catch((err: Error) => log.stack(err, 'fatal'))
}
