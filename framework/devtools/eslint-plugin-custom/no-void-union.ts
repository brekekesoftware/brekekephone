import type { TSESLint } from '@typescript-eslint/utils'

export const noVoidUnion: TSESLint.RuleModule<'noVoidUnion', []> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Use `T | undefined` or Void<T> instead',
    },
    messages: {
      noVoidUnion: 'Use `T | undefined` or Void<T> instead',
    },
    schema: [],
  },

  defaultOptions: [],

  create: c => ({
    TSUnionType: n => {
      for (const t of n.types) {
        if (t.type === 'TSVoidKeyword') {
          c.report({
            node: t,
            messageId: 'noVoidUnion',
          })
        }
      }
    },
  }),
}
