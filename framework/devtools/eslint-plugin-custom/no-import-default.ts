import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

export const noImportDefault: TSESLint.RuleModule<
  'noImportDefault',
  [string[]]
> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow import `default` or `* as` from specific packages',
    },
    messages: {
      noImportDefault:
        "Disallow import `default` or `* as` from '{{pkg}}'. Use named imports instead",
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

  defaultOptions: [[]],

  create: c => {
    const pkgs = new Set(c.options[0])
    const check = (n: TSESTree.ImportClause, pkg: string) => {
      if (
        n.type === 'ImportDefaultSpecifier' ||
        n.type === 'ImportNamespaceSpecifier'
      ) {
        c.report({
          node: n,
          messageId: 'noImportDefault',
          data: {
            pkg,
          },
        })
      }
    }
    return {
      ImportDeclaration: n => {
        const pkg = n.source.value
        if (!pkgs.has(pkg)) {
          return
        }
        n.specifiers.forEach(s => check(s, pkg))
      },
    }
  },
}
