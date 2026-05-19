import { getInAlias } from '@/devtools/ts/get-alias'
import { path } from '@/nodejs/path'
import type { StrMap } from '@/shared/ts-utils'

const extensions = ['ts', 'tsx']
const indexes = ['', '/index']
const alreadyResolved = ['client', 'server', 'native', 'ios', 'android']

type Options = {
  alias: StrMap<string>
  clients: StrMap<true>
  currentFilename: string
  importPath: string
}

export const getClientVariant = ({
  alias,
  clients,
  currentFilename,
  importPath,
}: Options) => {
  if (alreadyResolved.some(k => importPath.endsWith(`.${k}`))) {
    return
  }
  let baseAbs = ''
  if (importPath.startsWith('.')) {
    baseAbs = path.join(path.dirname(currentFilename), importPath)
  } else {
    const [k, v] = getInAlias(importPath, alias)
    if (k && v) {
      baseAbs = path.join(v, importPath.replace(k, ''))
    }
  }
  if (!baseAbs) {
    return
  }
  for (const ext of extensions) {
    for (const idx of indexes) {
      const abs = `${baseAbs}${idx}.client.${ext}`
      if (currentFilename === abs) {
        // allow to import 'something' in something.variant, if we transpile here it will import itself
        // NOTE: in react native, it is transpiled anyway and it will import itself with this case
        return
      }
      if (clients[abs]) {
        return `${importPath}${idx}.client`
      }
    }
  }
  return
}
