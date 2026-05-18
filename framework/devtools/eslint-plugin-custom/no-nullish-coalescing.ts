import type { TSESLint } from '@typescript-eslint/utils'

export const noNullishCoalescing: TSESLint.RuleModule<
  'noNullishCoalescing',
  []
> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Make it more verbose such as `!v ? v1 : v2` or `v || v1` or `v && v1`',
    },
    messages: {
      noNullishCoalescing:
        'Make it more verbose such as `!v ? v1 : v2` or `v || v1` or `v && v1`',
    },
    schema: [],
  },

  defaultOptions: [],

  create: c => ({
    LogicalExpression: n => {
      if (!n) {
        return
      }
      if (n.operator !== '??') {
        return
      }
      c.report({
        node: n,
        messageId: 'noNullishCoalescing',
      })
    },
  }),
}
