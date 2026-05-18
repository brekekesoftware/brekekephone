import type { Node, NodePath } from '@babel/core'
import { types as t } from '@babel/core'

import type { Ctx } from '@/devtools/babel-plugin-tw/lib/context'
import type { StrMap } from '@/shared/ts-utils'

export type Literal = undefined | null | boolean | number | string
export type WithPath<T = any> = {
  path: NodePath
  keyPath?: NodePath
  value: T
}
export type MapWp<T = any> = StrMap<WithPath<T>>
export type ArrWp<T> = WithPath<T>[]

export const pathToNode = (
  ctx: Ctx,
  path: NodePath,
  keyPath: NodePath | undefined,
): WithPath<Node> => ({
  path,
  keyPath,
  value: path.node,
})

export const isUndefined = (node: t.Node) =>
  t.isIdentifier(node, { name: 'undefined' })

export const pathToLiteral = (
  ctx: Ctx,
  path: NodePath,
  keyPath: NodePath | undefined,
): WithPath<Literal> => {
  let value
  const v = path.node
  if (isUndefined(v)) {
    value = undefined
  } else if (t.isNullLiteral(v)) {
    value = null
  } else if (
    t.isBooleanLiteral(v) ||
    t.isNumericLiteral(v) ||
    t.isStringLiteral(v)
  ) {
    value = v.value
  } else {
    throw ctx.err(path, `expect a literal, found ${v.type}`)
  }
  return {
    path,
    value,
    keyPath,
  }
}

export const pathToString = (
  ctx: Ctx,
  path: NodePath,
  keyPath: NodePath | undefined,
): WithPath<string> => {
  const l = pathToLiteral(ctx, path, keyPath)
  if (typeof l.value !== 'string') {
    throw ctx.err(path, 'expect string literal')
  }
  return l as any
}

export const pathToPropertyName = (ctx: Ctx, path: NodePath) => {
  const k = path.node
  let name
  if (t.isIdentifier(k)) {
    name = k.name
  } else if (t.isStringLiteral(k)) {
    name = k.value
  } else {
    throw ctx.err(path, `can not get property name from type ${k.type}`)
  }
  if (!/^[a-z]/.test(name)) {
    // reserved some keys to use in runtime
    throw ctx.err(path, `expect property name "${name}" to start with a-z`)
  }
  return name
}

export const pathToObject = <T = any>(
  ctx: Ctx,
  path: NodePath<t.ObjectExpression>,
  keyPath: NodePath | undefined,
  inner: (k: string, kPath: NodePath, innerPath: NodePath<any>) => WithPath<T>,
) => {
  if (!t.isObjectExpression(path.node)) {
    throw ctx.err(path, 'expect simple object literal')
  }
  const value: MapWp<T> = {}
  for (const innerPath of path.get('properties')) {
    const p = innerPath.node
    if (!t.isObjectProperty(p) || p.computed) {
      throw ctx.err(innerPath, 'expect simple object properties')
    }
    const kPath = innerPath.get('key')
    const k = pathToPropertyName(ctx, kPath)
    value[k] = inner(k, kPath, innerPath.get('value'))
  }
  return {
    path,
    value,
    keyPath,
  }
}

export const pathToObjectLiteral = (
  ctx: Ctx,
  path: NodePath<t.ObjectExpression>,
  keyPath: NodePath | undefined,
) =>
  pathToObject(ctx, path, keyPath, (k, kPath, innerPath) =>
    pathToLiteral(ctx, innerPath, kPath),
  )

export const pathToObjectString = (
  ctx: Ctx,
  path: NodePath<t.ObjectExpression>,
  keyPath: NodePath | undefined,
) =>
  pathToObject(ctx, path, keyPath, (k, kPath, innerPath) =>
    pathToString(ctx, innerPath, kPath),
  )

export const pathToArray = <T = any>(
  ctx: Ctx,
  path: NodePath<t.ArrayExpression>,
  keyPath: NodePath | undefined,
  inner: (i: number, innerPath: NodePath<any>) => WithPath<T>,
) => {
  if (!t.isArrayExpression(path.node)) {
    throw ctx.err(path, 'expect simple array literal')
  }
  const value: ArrWp<T> = []
  for (const [i, innerPath] of path.get('elements').entries()) {
    if (!innerPath?.node) {
      throw ctx.err(innerPath, `missing array element at index ${i}`)
    }
    value.push(inner(i, innerPath as any))
  }
  return {
    path,
    value,
    keyPath,
  }
}
