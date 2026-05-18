import { types as t } from '@babel/core'

import type { Ctx } from '@/devtools/babel-plugin-tw/lib/context'
import { jsonSafe } from '@/shared/json-safe'

export const jsToNode = (ctx: Ctx, value: any): any => {
  if (t.isNode(value)) {
    return value
  }

  if (value === null) {
    return t.nullLiteral()
  }
  if (value === undefined) {
    return t.buildUndefinedNode()
  }

  const type = typeof value

  if (type === 'string') {
    return t.stringLiteral(value)
  }
  if (type === 'number') {
    return t.numericLiteral(value)
  }
  if (type === 'boolean') {
    return t.booleanLiteral(value)
  }

  if (Array.isArray(value)) {
    return t.arrayExpression(value.map(v => jsToNode(ctx, v)))
  }

  if (type === 'object') {
    const props = Object.entries(value).map(([k, v]) => {
      const keyNode = t.stringLiteral(k)
      const valueNode = jsToNode(ctx, v)
      return t.objectProperty(keyNode, valueNode)
    })
    return t.objectExpression(props)
  }

  const v = jsonSafe(value)
  throw ctx.err(
    ctx.rootPath,
    `BUG: unsupported js to node type ${type} with value: ${v}`,
  )
}
