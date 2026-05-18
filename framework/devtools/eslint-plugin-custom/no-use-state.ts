import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

export const noUseState: TSESLint.RuleModule<'noUseState', []> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Use `useImmer` or `useClassState` instead of `useState`',
    },
    messages: {
      noUseState: 'Use `useImmer` or `useClassState` instead of `useState`',
    },
    schema: [],
  },
  create: c => {
    const check = (
      n: TSESTree.ImportSpecifier | TSESTree.CallExpression,
      name: string,
    ) => {
      if (name !== 'useState') {
        return
      }
      c.report({
        node: n,
        messageId: 'noUseState',
      })
    }
    return {
      ImportDeclaration: n => {
        for (const s of n.specifiers) {
          if (
            s.type === 'ImportSpecifier' &&
            s.imported.type === 'Identifier'
          ) {
            check(s, s.imported.name)
          }
        }
      },
      CallExpression: n => {
        if (n.callee.type === 'Identifier') {
          check(n, n.callee.name)
        }
        if (
          n.callee.type === 'MemberExpression' &&
          n.callee.property.type === 'Identifier'
        ) {
          check(n, n.callee.property.name)
        }
      },
    }
  },
  defaultOptions: [],
}
