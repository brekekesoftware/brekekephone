import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const variants = ['native', 'ios', 'android', 'client'] as const

const getVariant = (path: string) => {
  const withoutExt = path.replace(/\.[jt]sx?$/, '')
  for (const v of variants) {
    if (withoutExt.endsWith(`.${v}`)) {
      return v
    }
  }
  return
}

export const noImportInvalidVariant: TSESLint.RuleModule<
  'noImportInvalidVariant',
  []
> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Import with a variant suffix requires current file to have the same variant suffix',
    },
    messages: {
      noImportInvalidVariant:
        "Import '{{importPath}}' has variant '.{{variant}}' but this file does not",
    },
    schema: [],
  },

  defaultOptions: [],

  create: c => {
    const fileVariant = getVariant(c.filename)

    const check = (src: TSESTree.StringLiteral | null) => {
      if (!src) {
        return
      }
      const importPath = src.value
      const importVariant = getVariant(importPath)
      if (!importVariant || fileVariant === importVariant) {
        return
      }
      c.report({
        node: src,
        messageId: 'noImportInvalidVariant',
        data: { importPath, variant: importVariant },
      })
    }

    return {
      ImportDeclaration: n => n.importKind !== 'type' && check(n.source),
      ExportNamedDeclaration: n =>
        n.exportKind !== 'type' &&
        n.specifiers.some(s => s.exportKind !== 'type') &&
        check(n.source),
      ExportAllDeclaration: n => n.exportKind !== 'type' && check(n.source),
    }
  },
}
