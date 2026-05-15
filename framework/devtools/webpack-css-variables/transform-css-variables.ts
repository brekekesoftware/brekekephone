import * as csstree from 'css-tree'

import { jsonSafe } from '@/shared/json-safe'
import type { StrMap } from '@/shared/ts-utils'

export const cssVariablesFilenameRegex = /\.extract-variables\.css$/

export const transformCssVariables = (src: string) => {
  const vars = extractCssVariables(src)
  return `export default ${jsonSafe(vars)}`
}

const extractCssVariables = (src: string): StrMap<string> => {
  const ast = csstree.parse(src)
  const vars: StrMap<string> = {}

  csstree.walk(ast, {
    visit: 'Declaration',
    enter: n => {
      if (
        n.type === 'Declaration' &&
        typeof n.property === 'string' &&
        n.property.startsWith('--')
      ) {
        const varName = n.property
        const varValue = csstree.generate(n.value).trim()
        vars[varName] = varValue
      }
    },
  })

  return vars
}
