import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

export const noSingleItemArrayProp: TSESLint.RuleModule<
  'noSingleItemArrayProp',
  [string[]]
> = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Disallow single-item arrays in JSX props - unwrap to the item directly',
    },
    messages: {
      noSingleItemArrayProp:
        'Single-item array in `{{prop}}` prop - remove the array wrapper',
    },
    schema: [
      {
        type: 'array',
        items: {
          type: 'string',
          required: true,
        },
        minItems: 1,
        uniqueItems: true,
        required: true,
      },
    ],
  },

  create: c => {
    const props = new Set(c.options[0])
    return {
      JSXAttribute: (n: TSESTree.JSXAttribute) => {
        if (n.name.type !== 'JSXIdentifier') {
          return
        }
        if (!props.has(n.name.name)) {
          return
        }
        const value = n.value
        if (!value || value.type !== 'JSXExpressionContainer') {
          return
        }
        const expr = value.expression
        if (expr.type !== 'ArrayExpression') {
          return
        }
        if (expr.elements.length !== 1) {
          return
        }
        const item = expr.elements[0]
        if (!item || item.type === 'SpreadElement') {
          return
        }
        c.report({
          node: n,
          messageId: 'noSingleItemArrayProp',
          data: { prop: n.name.name },
          fix: f => f.replaceText(expr, c.sourceCode.getText(item)),
        })
      },
    }
  },
}
