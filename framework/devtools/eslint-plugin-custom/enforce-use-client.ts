import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import { shouldTranspileExtension } from '@/devtools/babel-config/should-transpile'

type MessageId = 'enforceUseClient' | 'wrongPosition' | 'missingNewlines'

export const enforceUseClient: TSESLint.RuleModule<MessageId, [string[]]> = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: "Enforce 'use client' directive when required",
    },
    messages: {
      enforceUseClient: "File must start with 'use client' directive",
      wrongPosition: "'use client' directive must be at the top of the file",
      missingNewlines: "'use client' directive must be followed by 2 newlines",
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
    if (
      !shouldTranspileExtension.test(c.filename) ||
      /\.(ios|android|native)\.tsx?$/.test(c.filename)
    ) {
      return {}
    }

    let hasUseClient = false
    let useClientNode: TSESTree.ExpressionStatement | null = null
    let shouldEnforce = /\.client\.tsx?$/.test(c.filename)
    const importMatches = new Set(c.options[0] || [])

    return {
      Program: n => {
        // Find directive in leading directive prologue position
        for (const stmt of n.body) {
          if (stmt.type !== 'ExpressionStatement') {
            break
          }
          const expr = stmt.expression
          if (expr.type !== 'Literal' || typeof expr.value !== 'string') {
            break
          }
          if (expr.value === 'use client') {
            hasUseClient = true
            useClientNode = stmt
            break
          }
        }
        // If not found at top, search the whole body
        if (!useClientNode) {
          for (const stmt of n.body) {
            if (
              stmt.type === 'ExpressionStatement' &&
              stmt.expression.type === 'Literal' &&
              stmt.expression.value === 'use client'
            ) {
              useClientNode = stmt
              break
            }
          }
        }
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
        if (!shouldEnforce) {
          return
        }

        const text = c.sourceCode.getText()

        if (!hasUseClient) {
          // Directive is missing entirely -> add at top
          if (!useClientNode) {
            c.report({
              node: n,
              messageId: 'enforceUseClient',
              fix: f => f.insertTextBeforeRange([0, 0], "'use client'\n\n"),
            })
            return
          }

          // Directive exists but below non-comment content -> move to top
          const [start, end] = useClientNode.range
          c.report({
            node: useClientNode,
            messageId: 'wrongPosition',
            fix: f => {
              let removeEnd = end
              while (removeEnd < text.length && text[removeEnd] === '\n') {
                removeEnd++
              }
              return [
                f.removeRange([start, removeEnd]),
                f.insertTextBeforeRange([0, 0], "'use client'\n\n"),
              ]
            },
          })
          return
        }

        // type guarantee
        if (!useClientNode) {
          return
        }

        // Directive is at top - check trailing newlines
        const [, directiveEnd] = useClientNode.range
        let pos = directiveEnd
        let newlineCount = 0
        while (pos < text.length && text[pos] === '\n') {
          newlineCount++
          pos++
        }
        if (newlineCount >= 2) {
          return
        }
        c.report({
          node: useClientNode!,
          messageId: 'missingNewlines',
          fix: f =>
            f.replaceTextRange(
              [directiveEnd, directiveEnd],
              '\n'.repeat(2 - newlineCount),
            ),
        })
      },
    }
  },
}
