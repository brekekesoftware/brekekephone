import type { NodePath, types as t } from '@babel/core'

import type { Ctx } from '@/devtools/babel-plugin-tw/lib/context'
import { jsToNode } from '@/devtools/babel-plugin-tw/lib/js-to-node'
import { reconstructFn } from '@/devtools/babel-plugin-tw/lib/reconstruct-fn'
import { transpileClassNameJsx } from '@/devtools/babel-plugin-tw/lib/transpile-class-name-jsx'

export const transpileClsx = (ctx: Ctx, path: NodePath<t.CallExpression>) => {
  let transpiled: any = path
    .get('arguments')
    .map(a => transpileClassNameJsx(ctx, a))
    .flat(Infinity as 0)
    .filter(a => a)

  let call: string | undefined = 'apply'
  if (transpiled.length <= 1) {
    transpiled = transpiled[0]
    call = undefined
  }

  transpiled = jsToNode(ctx, transpiled)

  if (ctx.platform !== 'web') {
    return transpiled
  }

  return reconstructFn(ctx, transpiled, call)
}
