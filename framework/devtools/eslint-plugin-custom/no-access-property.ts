import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import type { StrMap } from '@/shared/ts-utils'

export const noAccessProperty: TSESLint.RuleModule<
  'noAccessProperty',
  [StrMap<string>]
> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow accessing on some specific properties',
    },
    messages: {
      noAccessProperty:
        'Accessing property `{{prop}}` is not allowed. Use `{{instead}}` instead',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
      },
    ],
  },

  defaultOptions: [{}],

  create: c => {
    const props = c.options[0]
    const check = (n: TSESTree.Node, prop: string) => {
      const instead = props[prop]
      if (typeof instead !== 'string') {
        return
      }
      c.report({
        node: n,
        messageId: 'noAccessProperty',
        data: {
          prop,
          instead,
        },
      })
    }
    return {
      // object.prop
      // object['prop']
      MemberExpression: n => {
        if (!n.computed) {
          check(n, n.property.name)
        }
        if (
          n.computed &&
          n.property.type === 'Literal' &&
          typeof n.property.value === 'string'
        ) {
          check(n, n.property.value)
        }
      },
      // { prop } = object
      // { prop: something } = object
      // { ['prop']: something } = object
      Property: n => {
        if (n.parent.type === 'ObjectPattern' && n.key.type === 'Identifier') {
          check(n, n.key.name)
        }
        if (
          n.parent.type === 'ObjectPattern' &&
          n.key.type === 'Literal' &&
          typeof n.key.value === 'string'
        ) {
          check(n, n.key.value)
        }
      },
    }
  },
}
