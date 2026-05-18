import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import { path } from '@/nodejs/path'

export const noRelativeExportPaths: TSESLint.RuleModule<
  'noRelativeExportPaths',
  [
    {
      absPath: string
      alias: string
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
          absPath: {
            type: 'string',
            required: true,
          },
          alias: {
            type: 'string',
            required: true,
          },
        },
        additionalProperties: false,
        required: true,
      },
    ],
    messages: {
      noRelativeExportPaths: "Use '{{alias}}' alias export instead of relative",
    },
  },

  create: c => {
    const { absPath, alias } = c.options[0]

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
      if (!isInDir(absPath, abs)) {
        return
      }

      const expectImportPath = `${alias}/${path.relative(absPath, abs)}`

      c.report({
        node: s,
        messageId: 'noRelativeExportPaths',
        data: {
          alias: expectImportPath,
        },
        fix: fixer => {
          const replacement = `'${expectImportPath}'`
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
