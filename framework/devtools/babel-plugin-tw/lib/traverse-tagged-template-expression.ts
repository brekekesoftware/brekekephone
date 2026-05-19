import type { NodePath } from '@babel/core'
import { types as t } from '@babel/core'

import { twFn } from '@/devtools/babel-plugin-tw/lib/config'
import { context } from '@/devtools/babel-plugin-tw/lib/context'
import { jsToNode } from '@/devtools/babel-plugin-tw/lib/js-to-node'
import type { TraverseOptions } from '@/devtools/babel-plugin-tw/visitor'

export const traverseTaggedTemplateExpression = (
  path: NodePath<t.TaggedTemplateExpression>,
  options: TraverseOptions,
) => {
  const tag = path.node.tag
  if (!t.isIdentifier(tag) || tag.name !== twFn.tw) {
    return
  }

  const ctx = context({
    ...options,
    rootPath: path,
  })
  let transpiled: any = ctx.transpileClassName({
    path,
    value: path.node.quasi.quasis.map(q => q.value.raw).join(' '),
  })

  if (ctx.extract) {
    return
  }

  transpiled = jsToNode(ctx, transpiled)
  path.replaceWith(transpiled)
}
