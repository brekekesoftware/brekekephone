import type { NodePath } from '@babel/core'
import { types as t } from '@babel/core'

import { twFn } from '@/devtools/babel-plugin-tw/lib/config'
import { context } from '@/devtools/babel-plugin-tw/lib/context'
import { transpileClsx } from '@/devtools/babel-plugin-tw/lib/transpile-clsx'
import { transpileCva } from '@/devtools/babel-plugin-tw/lib/transpile-cva'
import type { TraverseOptions } from '@/devtools/babel-plugin-tw/visitor'

export const traverseCallExpression = (
  path: NodePath<t.CallExpression>,
  options: TraverseOptions,
) => {
  const callee = path.node.callee
  if (!t.isIdentifier(callee)) {
    return
  }

  const calleeName = callee.name
  if (calleeName !== twFn.cva && calleeName !== twFn.clsx) {
    return
  }

  const ctx = context({
    ...options,
    rootPath: path,
    calleeName,
  })
  const transpiled =
    calleeName === twFn.cva ? transpileCva(ctx, path) : transpileClsx(ctx, path)

  if (ctx.extract) {
    return
  }

  path.replaceWith(transpiled)
}
