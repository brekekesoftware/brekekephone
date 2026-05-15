import type { NodePath } from '@babel/core'
import { types as t } from '@babel/core'

import type { Ctx } from '@/devtools/babel-plugin-tw/lib/context'
import type {
  ArrWp,
  Literal,
  MapWp,
  WithPath,
} from '@/devtools/babel-plugin-tw/lib/path-to-js'
import {
  pathToArray,
  pathToLiteral,
  pathToObject,
  pathToObjectString,
  pathToString,
} from '@/devtools/babel-plugin-tw/lib/path-to-js'

export type ClassNames = MapWp<string>
export type Attr = MapWp<string | ClassNames>
export type Attrs = MapWp<Attr>
export type Variant = MapWp<Literal>
export type CompoundVariant = Variant &
  Pick<Options, 'className' | 'classNames'>
export type Options = {
  className?: WithPath<string>
  classNames?: WithPath<ClassNames>
  attributes?: WithPath<Attrs>
  compoundVariants?: WithPath<ArrWp<CompoundVariant>>
}

export const pathToCvaOptions = (
  ctx: Ctx,
  path: NodePath<t.CallExpression>,
) => {
  const argumentsPath = path.get('arguments')
  if (argumentsPath?.length !== 1) {
    throw ctx.err(path, 'expect exactly one argument')
  }

  const argPath = argumentsPath[0] as NodePath<any>

  const cva = pathToObject<any>(
    ctx,
    argPath,
    undefined,
    (k, kPath, innerPath) => {
      if (k === 'className') {
        return pathToString(ctx, innerPath, kPath)
      }
      if (k === 'classNames') {
        return pathToObjectString(ctx, innerPath, kPath)
      }
      if (k === 'attributes') {
        return pathToObject<any>(
          ctx,
          innerPath,
          kPath,
          (k2, kPath2, innerPath2) =>
            pathToObject<any>(
              ctx,
              innerPath2,
              kPath2,
              (k3, kPath3, innerPath3) =>
                t.isStringLiteral(innerPath3)
                  ? pathToString(ctx, innerPath3, kPath3)
                  : pathToObjectString(ctx, innerPath3, kPath3),
            ),
        )
      }
      if (k === 'compoundVariants') {
        return pathToArray(ctx, innerPath, kPath, (i, innerPath2) =>
          pathToObject<any>(
            ctx,
            innerPath2,
            undefined,
            (k3, kPath3, innerPath3) => {
              if (k3 === 'className') {
                return pathToString(ctx, innerPath3, kPath3)
              }
              if (k3 === 'classNames') {
                return pathToObjectString(ctx, innerPath3, kPath3)
              }
              return pathToLiteral(ctx, innerPath3, kPath3)
            },
          ),
        )
      }
      throw ctx.err(innerPath, `unknown key ${k}`)
    },
  )

  return cva.value as Options
}
