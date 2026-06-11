import { generate, parse, walk } from 'css-tree'
import { compileString } from 'sass'

import { jsonSafe } from '@/shared/json-safe'
import type { StrMap } from '@/shared/ts-utils'

export const cssExtractVariablesRegex = /\.extract-variables\.s?css$/

export const transformCssExtractVariables = (src: string, filename: string) => {
  if (filename.endsWith('.scss')) {
    src = compileString(src).css
  }
  return `export default ${jsonSafe(toJs(src))}`
}

const toJs = (src: string): StrMap<string> => {
  const ast = parse(src)
  const vars: StrMap<string> = {}

  walk(ast, {
    visit: 'Declaration',
    enter: n => {
      if (
        n.type === 'Declaration' &&
        typeof n.property === 'string' &&
        n.property.startsWith('--')
      ) {
        const k = n.property
        const v = generate(n.value).trim()
        vars[k] = v
      }
    },
  })

  return vars
}
