import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

export const errName: TSESLint.RuleModule<'errName', []> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Use `err` or `<some>Err` for error variable name',
    },
    messages: {
      errName: 'Use `err` or `<some>Err` for error variable name',
    },
    schema: [],
  },

  defaultOptions: [],

  create: c => {
    const check = (n: TSESTree.BindingName | TSESTree.Parameter) => {
      if (!n) {
        return
      }
      if (n.type !== 'Identifier' || /err$/i.test(n.name)) {
        return
      }
      c.report({
        node: n,
        messageId: 'errName',
      })
    }
    const checkFunction = (
      n: TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression,
    ) => {
      if (
        n.parent.type === 'CallExpression' &&
        n.parent.callee.type === 'MemberExpression' &&
        n.parent.callee.property.type === 'Identifier' &&
        n.parent.callee.property.name === 'catch'
      ) {
        n.params.forEach(check)
      }
    }
    return {
      // try {..} catch(err) {..}
      CatchClause: n => n.param && check(n.param),
      // .catch(function(err) {..})
      FunctionExpression: n => checkFunction(n),
      // .catch(err => {..})
      ArrowFunctionExpression: n => checkFunction(n),
      // const err = ..
      VariableDeclarator: n => {
        if (n.id.type === 'Identifier' && /erro/i.test(n.id.name)) {
          check(n.id)
        }
      },
    }
  },
}
