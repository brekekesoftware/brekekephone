import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import { shouldTranspileExtension } from '@/devtools/babel-config/should-transpile'

export const enforceUseClient: TSESLint.RuleModule<
  'enforceUseClient',
  [string[]?]
> = {
  meta: {
    type: 'problem',
    docs: {
      description: "Enforce 'use client' directive when required",
    },
    messages: {
      enforceUseClient: "File must start with 'use client' directive",
    },
    schema: [
      {
        type: 'array',
        items: {
          type: 'string',
        },
        uniqueItems: true,
      },
    ],
  },

  defaultOptions: [[]],

  create: c => {
    if (
      !shouldTranspileExtension.test(c.filename) ||
      /\.(ios|android|native)\.tsx?$/.test(c.filename)
    ) {
      return {}
    }

    let hasUseClient = false
    let shouldEnforce = /\.client\.tsx?$/.test(c.filename)
    const importMatches = new Set(c.options[0] || [])

    return {
      Program: n => {
        hasUseClient = hasUseClientDirective(n)
      },

      ImportDeclaration: n => {
        if (shouldEnforce || hasUseClient) {
          return
        }
        for (const s of n.specifiers) {
          if (
            s.type === 'ImportSpecifier' &&
            s.imported.type === 'Identifier' &&
            importMatches.has(s.imported.name)
          ) {
            shouldEnforce = true
          }
        }
      },

      'Program:exit': n => {
        if (!shouldEnforce || hasUseClient) {
          return
        }
        c.report({
          node: n,
          messageId: 'enforceUseClient',
        })
      },
    }
  },
}

const hasUseClientDirective = (program: TSESTree.Program): boolean => {
  for (const stmt of program.body) {
    if (stmt.type !== 'ExpressionStatement') {
      return false
    }

    const expr = stmt.expression
    if (expr.type !== 'Literal' || typeof expr.value !== 'string') {
      return false
    }

    if (expr.value === 'use client') {
      return true
    }
  }

  return false
}
