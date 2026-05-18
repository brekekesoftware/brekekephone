import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import { path } from '@/nodejs/path'

export const noImportOutside: TSESLint.RuleModule<
  'noImportOutside',
  [
    {
      rootDir: string
      alias: string
      dirs: string[]
    },
  ]
> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow import outside from specific folders',
    },
    messages: {
      noImportOutside: "Disallow import outside from '{{dir}}'",
    },
    schema: [
      {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    ],
  },

  defaultOptions: [
    {
      rootDir: '',
      alias: '',
      dirs: [],
    },
  ],

  create: c => {
    const { rootDir, alias } = c.options[0]
    const dirs = c.options[0].dirs.map(d =>
      d.replace(/^\/+/, '').replace(/\/+$/, ''),
    )
    if (!rootDir) {
      throw new Error('Missing rootDir')
    }
    if (!rootDir) {
      throw new Error('Missing alias')
    }
    if (!dirs.length) {
      throw new Error('Missing dirs')
    }

    const prefixes = dirs.map(d => path.join(rootDir, `./${d}/`))
    const file = c.filename
    const i = prefixes.findIndex(v => file.startsWith(v))
    if (i < 0) {
      return {}
    }
    const aliasPrefix = `${alias}/`
    const importPrefix = `${aliasPrefix}${dirs[i]}/`

    const dir = importPrefix.replace(/\/+$/, '')

    const check = (src: TSESTree.StringLiteral | null) => {
      if (!src) {
        return
      }
      const importPath = src.value
      if (
        !importPath.startsWith(aliasPrefix) ||
        importPath.startsWith(importPrefix)
      ) {
        return
      }
      c.report({ node: src, messageId: 'noImportOutside', data: { dir } })
    }

    return {
      ImportDeclaration: n => check(n.source),
      ExportNamedDeclaration: n => check(n.source),
      ExportAllDeclaration: n => check(n.source),
    }
  },
}
