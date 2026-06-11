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
  'tsc',
  'type-coverage',
] as const
type Pkg = (typeof supported)[number]
const fmtPkgs: Pkg[] = ['doctoc', 'eslint', 'stylelint']
const tsPkgs: Pkg[] = ['tsc', 'type-coverage']

const argvPkg = process.argv[2] as Pkg
if (!supported.some(v => v === argvPkg)) {
  log.fatal(`Invalid devtools script ${argvPkg}`)
}

type Options = {
  dir: string
}

const r = async (p: Pkg, { dir }: Options) => {
  await require(`@/devtools/${p}`).run(dir)
}
const fmt = async (o: Options) => {
  // need to run in this order to avoid conflicts between commands
  await r('normalize', o)
  await Promise.all(fmtPkgs.map(p => r(p, o)))
  await r('prettier', o)
}
const ts = async (o: Options) => {
  await Promise.all(tsPkgs.map(p => r(p, o)))
}
const all = async (o: Options) => {
  await Promise.all([fmt(o), ts(o)])
}

export const run = async (o: Options) => {
  let p: Promise<unknown>
  if (argvPkg === 'all') {
    p = all(o)
  } else if (argvPkg === 'fmt') {
    p = fmt(o)
  } else if (argvPkg === 'ts') {
    p = ts(o)
  } else {
    p = r(argvPkg, o)
  }
  await p.catch((err: Error) => log.stack(err, 'fatal'))
}
