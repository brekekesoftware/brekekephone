import type { TSESLint } from '@typescript-eslint/utils'

export const noJsonStringify: TSESLint.RuleModule<'noJsonStringify', []> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Use `jsonSafe` instead of `JSON.stringify`',
    },
    messages: {
      noJsonStringify: 'Use `jsonSafe` instead of `JSON.stringify`',
    },
    schema: [],
  },

  defaultOptions: [],

  create: c => ({
    CallExpression: n => {
      if (
        n.callee.type === 'MemberExpression' &&
        n.callee.object.type === 'Identifier' &&
        n.callee.object.name === 'JSON' &&
        n.callee.property.type === 'Identifier' &&
        n.callee.property.name === 'stringify'
      ) {
        c.report({
          node: n,
          messageId: 'noJsonStringify',
        })
      }
    },
  }),
}
