import template from '@babel/template'

import type { Ctx } from '@/devtools/babel-plugin-tw/lib/context'
import { jsToNode } from '@/devtools/babel-plugin-tw/lib/js-to-node'

// need to use .call or .apply to avoid infinite transpile once replaced
const tpl = template.expression('%%fn%%.%%call%%(undefined, %%arg%%)')

export const reconstructFn = (ctx: Ctx, arg: any, call = 'call') =>
  tpl({
    fn: ctx.calleeName,
    arg: jsToNode(ctx, arg),
    call,
  })
