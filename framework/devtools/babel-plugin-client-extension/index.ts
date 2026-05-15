import type { ConfigAPI, PluginObj } from '@babel/core'
import { z } from 'zod'

import { getClientVariant } from '@/devtools/babel-config/get-client-variant'
import {
  getCallerAlias,
  getCallerClients,
  getCallerIsServer,
  getIsServer,
} from '@/devtools/babel-config/is-server'
import { shouldTranspile } from '@/devtools/babel-config/should-transpile'
import type { StrMap } from '@/shared/ts-utils'

const pluginPassOptsSchema = z.object({
  alias: z.record(z.string(), z.string()).optional(),
  clients: z.array(z.string()).optional(),
})

export const clientExtensionPlugin = (api: ConfigAPI): PluginObj => {
  const callerIsServer = getCallerIsServer(api)
  const callerAlias = getCallerAlias(api)
  const callerClients = getCallerClients(api)

  return {
    visitor: {
      // use program path to get plugin pass and perform some checks before traverse
      // also prioritize this plugin over others such as react compiler
      Program: (programPath, pluginPass) => {
        if (!shouldTranspile(pluginPass.filename)) {
          return
        }
        const isServer = getIsServer(pluginPass, callerIsServer)
        if (isServer) {
          return
        }

        const { alias: pluginPassAlias, clients: pluginPassClients } =
          pluginPassOptsSchema.parse(pluginPass.opts)
        const alias = pluginPassAlias || callerAlias
        const clients = pluginPassClients || callerClients
        if (!alias || !clients) {
          return
        }

        const clientMap = clients.reduce<StrMap<true>>((m, a) => {
          m[a] = true
          return m
        }, {})
        const currentFilename = pluginPass.filename as string

        programPath.traverse({
          ImportDeclaration: p => {
            const n = p.node
            if (n.importKind === 'type') {
              return
            }
            const clientVariant = getClientVariant({
              alias,
              clients: clientMap,
              currentFilename,
              importPath: n.source.value,
            })
            if (!clientVariant) {
              return
            }
            n.source.value = clientVariant
          },
        })
      },
    },
  }
}
