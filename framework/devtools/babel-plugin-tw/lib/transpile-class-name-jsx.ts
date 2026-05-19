import type { Node, NodePath } from '@babel/core'
import { types as t } from '@babel/core'

import type { Ctx } from '@/devtools/babel-plugin-tw/lib/context'
import { jsToNode } from '@/devtools/babel-plugin-tw/lib/js-to-node'
import { omitEmpty } from '@/devtools/babel-plugin-tw/lib/utils'
import type { ClassName } from '@/rn/core/tw/class-name'

export const transpileClassNameJsx = (
  ctx: Ctx,
  v: NodePath,
): ClassName | Node => {
  if (t.isStringLiteral(v.node)) {
    return ctx.transpileClassName({
      path: v,
      value: v.node.value,
    })
  }

  if (t.isLogicalExpression(v.node) && v.node.operator === '&&') {
    let right: any = transpileClassNameJsx(
      ctx,
      v.get('right') as NodePath<t.Expression>,
    )
    right = omitEmpty(right)
    if (!right) {
      return
    }
    right = jsToNode(ctx, right)
    return t.logicalExpression(v.node.operator, v.node.left, right)
  }

  if (t.isConditionalExpression(v.node)) {
    let consequent: any = transpileClassNameJsx(
      ctx,
      v.get('consequent') as NodePath<t.Expression>,
    )
    let alternate: any = transpileClassNameJsx(
      ctx,
      v.get('alternate') as NodePath<t.Expression>,
    )
    consequent = omitEmpty(consequent)
    alternate = omitEmpty(alternate)
    if (!consequent && !alternate) {
      return
    }
    consequent = jsToNode(ctx, consequent)
    alternate = jsToNode(ctx, alternate)
    return t.conditionalExpression(v.node.test, consequent, alternate)
  }

  if (
    t.isIdentifier(v.node) ||
    t.isMemberExpression(v.node) ||
    t.isOptionalMemberExpression(v.node)
  ) {
    return v.node
  }

  if (t.isArrayExpression(v.node)) {
    let elements: any = v
      .get('elements')
      .map(e => transpileClassNameJsx(ctx, e as NodePath<t.Expression>))
      .flat(Infinity as 0)
      .filter(e => e)
    elements = omitEmpty(elements)
    if (!elements) {
      return
    }
    if (elements.length === 1) {
      return elements[0]
    }
    return elements
  }

  if (t.isJSXExpressionContainer(v.node)) {
    return transpileClassNameJsx(ctx, v.get('expression'))
  }

  if (t.isTSAsExpression(v.node)) {
    return transpileClassNameJsx(ctx, v.get('expression'))
  }

  throw ctx.err(
    v,
    'expect: string literal | logical and expression | conditional expression | identifier | member expression | array literal',
  )
}
