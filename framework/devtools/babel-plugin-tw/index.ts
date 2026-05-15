import type { PluginObj } from '@babel/core'

import { createVisitor } from '@/devtools/babel-plugin-tw/visitor'

export const twPlugin = (): PluginObj => ({
  visitor: createVisitor(),
})
