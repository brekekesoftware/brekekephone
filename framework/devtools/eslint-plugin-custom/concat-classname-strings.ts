import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

export const concatClassnameStrings: TSESLint.RuleModule<
  'concatClassnameStrings',
  [string[]?]
> = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Concatenate adjacent string literals in className array props',
    },
    messages: {
      concatClassnameStrings:
        'Adjacent string literals in `{{prop}}` array - merge them into a single string',
    },
    schema: [
      {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 0,
        uniqueItems: true,
      },
    ],
  },

  create: c => {
    const propList = c.options[0]
    const propSet = propList && new Set(propList)

    const matchesProp = (name: string) =>
      propSet
        ? propSet.has(name)
        : name === 'className' || name.endsWith('ClassName')

    return {
      JSXAttribute: (n: TSESTree.JSXAttribute) => {
        if (n.name.type !== 'JSXIdentifier') {
          return
        }
        if (!matchesProp(n.name.name)) {
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

        // Check if there are at least 2 consecutive direct string literals
        let hasAdjacentStrings = false
        let run = 0
        for (const el of expr.elements) {
          if (el && el.type === 'Literal' && typeof el.value === 'string') {
            run++
            if (run >= 2) {
              hasAdjacentStrings = true
              break
            }
          } else {
            run = 0
          }
        }

        if (!hasAdjacentStrings) {
          return
        }

        c.report({
          node: expr,
          messageId: 'concatClassnameStrings',
          data: { prop: n.name.name },
          fix: f => {
            const newElements: string[] = []
            let group: TSESTree.Literal[] = []

            const flushGroup = () => {
              if (group.length === 0) {
                return
              }
              if (group.length === 1) {
                newElements.push(c.sourceCode.getText(group[0]))
              } else {
                const quoteChar = c.sourceCode.getText(group[0])[0]
                const merged = group.map(s => String(s.value)).join(' ')
                const escaped = merged.split(quoteChar).join('\\' + quoteChar)
                newElements.push(`${quoteChar}${escaped}${quoteChar}`)
              }
              group = []
            }

            for (const el of expr.elements) {
              if (el && el.type === 'Literal' && typeof el.value === 'string') {
                group.push(el)
              } else {
                flushGroup()
                if (el) {
                  newElements.push(c.sourceCode.getText(el))
                }
              }
            }
            flushGroup()

            return f.replaceText(expr, `[${newElements.join(', ')}]`)
          },
        })
      },
    }
  },
}
