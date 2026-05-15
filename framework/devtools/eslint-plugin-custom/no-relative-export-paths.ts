import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import { path } from '@/nodejs/path'
import { repoRoot } from '@/root'

export const noRelativeExportPaths: TSESLint.RuleModule<
  'noRelativeExportPaths',
  [
    {
      rootDir: string
      prefix: string
    },
  ]
> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow relative export paths',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          rootDir: {
            type: 'string',
            required: true,
          },
          prefix: {
            type: 'string',
            required: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noRelativeExportPaths: "Use '{{alias}}' alias export instead of relative",
    },
  },

  defaultOptions: [
    {
      rootDir: '',
      prefix: '',
    },
  ],

  create: c => {
    let { rootDir } = c.options[0]
    if (rootDir.startsWith('.')) {
      rootDir = path.join(repoRoot, rootDir)
    }
    const { prefix } = c.options[0]
    if (!rootDir) {
      throw new Error('Missing rootDir')
    }
    if (!prefix) {
      throw new Error('Missing prefix')
    }

    const check = (
      n: TSESTree.ExportNamedDeclaration | TSESTree.ExportAllDeclaration,
    ) => {
      if (n.source?.type !== 'Literal') {
        return
      }

      const s = n.source
      if (typeof s.value !== 'string' || !s.value.startsWith('.')) {
        return
      }

      const abs = path.resolve(path.dirname(c.filename), s.value)
      if (!isInDir(rootDir, abs)) {
        return
      }

      const alias = `${prefix}/${path.relative(rootDir, abs)}`

      c.report({
        node: s,
        messageId: 'noRelativeExportPaths',
        data: {
          alias,
        },
        fix: fixer => {
          const replacement = `'${alias}'`
          return fixer.replaceText(s, replacement)
        },
      })
    }

    return {
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
    }
  },
}

const isInDir = (dir: string, abs: string) => {
  if (!abs) {
    return
  }
  const relative = path.relative(dir, abs)
  return !path.isAbsolute(relative) && !relative.startsWith('..')
}
