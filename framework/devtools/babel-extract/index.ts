import { codeFrameColumns } from '@babel/code-frame'
import * as parser from '@babel/parser'
import type { NodePath, Visitor } from '@babel/traverse'
import traverse from '@babel/traverse'

import { twExtract } from '@/devtools/babel-plugin-tw/extract'
import { fs } from '@/nodejs/fs'
import { globSync } from '@/nodejs/glob'

type Options = {
  twExtractOutputPath: string
}
type Extractor = {
  visitor: Visitor<any>
  done: () => void
}

export const extract = ({ twExtractOutputPath }: Options) => {
  let currentCode = ''
  const err = (npath: NodePath, msg: string) => {
    const loc = npath.node?.loc
    if (!loc) {
      throw new Error(msg)
    }
    const frame = codeFrameColumns(
      currentCode,
      { start: loc.start, end: loc.end },
      { highlightCode: true },
    )
    return new Error(`${msg}\n${frame}`)
  }

  const extractors: Extractor[] = []
  if (process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES) {
    extractors.push(twExtract({ err, twExtractOutputPath }))
  }

  const paths = globSync('**/*.{ts,tsx}')

  const parserOption = {
    sourceType: 'module' as const,
    plugins: ['typescript' as const, 'jsx' as const],
  }
  for (const p of paths) {
    currentCode = fs.readFileSync(p, 'utf-8')
    const pluginPass = {
      filename: p,
      opts: {},
    }
    const ast = parser.parse(currentCode, parserOption)
    for (const { visitor } of extractors) {
      traverse(ast, visitor as any, undefined, pluginPass)
    }
  }

  for (const { done } of extractors) {
    done()
  }
}
