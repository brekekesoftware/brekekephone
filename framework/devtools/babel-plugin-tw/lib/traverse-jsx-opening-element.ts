import type { NodePath } from '@babel/core'
import { types as t } from '@babel/core'

import { context } from '@/devtools/babel-plugin-tw/lib/context'
import { jsToNode } from '@/devtools/babel-plugin-tw/lib/js-to-node'
import { transpileClassNameJsx } from '@/devtools/babel-plugin-tw/lib/transpile-class-name-jsx'
import type { TraverseOptions } from '@/devtools/babel-plugin-tw/visitor'

export const traverseJSXOpeningElement = (
  path: NodePath<t.JSXOpeningElement>,
  options: TraverseOptions,
) => {
  const classNames = path.get('attributes').filter(a => {
    if (!t.isJSXAttribute(a.node)) {
      return false
    }
    if (
      !(
        t.isStringLiteral(a.node.value) ||
        t.isJSXExpressionContainer(a.node.value)
      )
    ) {
      return false
    }
    if (!t.isJSXIdentifier(a.node.name)) {
      return false
    }
    const n = a.node.name.name
    return n === 'className' || n.endsWith('ClassName')
  }) as NodePath<t.JSXAttribute>[]

  if (!classNames.length) {
    return
  }

  for (const c of classNames) {
    const ctx = context({
      ...options,
      rootPath: path,
    })
    let transpiled: any = transpileClassNameJsx(
      ctx,
      c.get('value') as NodePath<t.StringLiteral | t.JSXExpressionContainer>,
    )

    if (ctx.extract) {
      continue
    }

    transpiled = jsToNode(ctx, transpiled)
    transpiled = t.jsxAttribute(
      c.node.name,
      t.jsxExpressionContainer(transpiled),
    )
    c.replaceWith(transpiled)
  }
}
