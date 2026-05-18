import type { Node, NodePath, types as t } from '@babel/core'

import type { Ctx } from '@/devtools/babel-plugin-tw/lib/context'
import type { ClassNames } from '@/devtools/babel-plugin-tw/lib/path-to-cva-options'
import { pathToCvaOptions } from '@/devtools/babel-plugin-tw/lib/path-to-cva-options'
import { reconstructFn } from '@/devtools/babel-plugin-tw/lib/reconstruct-fn'
import { omitEmpty } from '@/devtools/babel-plugin-tw/lib/utils'
import type { StrMap } from '@/shared/ts-utils'

type TranspiledOptions = {
  className?: Node
  classNames?: StrMap<Node>
  attributes?: StrMap<StrMap>
  compoundVariants?: StrMap<Node>[]
}

export const transpileCva = (ctx: Ctx, path: NodePath<t.CallExpression>) => {
  const { className, classNames, attributes, compoundVariants } =
    pathToCvaOptions(ctx, path)

  if ((!className && !classNames) || (className && classNames)) {
    throw ctx.err(path, 'expect one of className or classNames')
  }

  const transpileClassNames = (c: ClassNames) => {
    const m: StrMap = {}
    for (const [k, v] of Object.entries(c)) {
      const kp = v.keyPath || v.path
      if (!classNames?.value[k]) {
        throw ctx.err(kp, `${k} is missing at the root classNames`)
      }
      m[k] = ctx.transpileClassName(v)
    }
    return m
  }

  let jsRoot: any = undefined
  let jsRootKey: string | undefined = undefined
  if (className) {
    jsRoot = ctx.transpileClassName(className)
    jsRootKey = 'className'
  }
  if (classNames) {
    jsRoot = transpileClassNames(classNames.value)
    jsRootKey = 'classNames'
  }
  if (!jsRoot || !jsRootKey) {
    throw ctx.err(path, 'BUG: missing js root value or key')
  }

  const jsAttributes: Required<TranspiledOptions>['attributes'] = {}
  if (attributes) {
    for (const [k, v] of Object.entries(attributes.value)) {
      const js: StrMap = {}
      for (const [k1, v1] of Object.entries(v.value)) {
        if (typeof v1.value === 'string') {
          js[k1] = ctx.transpileClassName(v1 as any)
        } else {
          js[k1] = transpileClassNames(v1.value)
        }
      }
      jsAttributes[k] = js
    }
  }

  const jsCompoundVariants: Required<TranspiledOptions>['compoundVariants'] = []
  if (compoundVariants) {
    for (const v1 of compoundVariants.value) {
      const js: StrMap = {}
      for (const [k2, v2] of Object.entries(v1.value)) {
        if (k2 === 'className') {
          js[k2] = ctx.transpileClassName(v2 as any)
        } else if (k2 === 'classNames') {
          js[k2] = transpileClassNames(v2.value as any)
        } else {
          js[k2] = v2.value
        }
      }
      jsCompoundVariants.push(js)
    }
  }

  const transpiled: TranspiledOptions = {
    [jsRootKey]: jsRoot,
    attributes: omitEmpty(jsAttributes),
    compoundVariants: omitEmpty(jsCompoundVariants),
  }

  return reconstructFn(ctx, transpiled)
}
