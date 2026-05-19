import type { Resolver } from 'enhanced-resolve'

import { getClientVariant } from '@/devtools/babel-config/get-client-variant'
import {
  shouldTranspile,
  shouldTranspileExtension,
} from '@/devtools/babel-config/should-transpile'
import { getAlias } from '@/devtools/ts/get-alias'
import { isRelative, path } from '@/nodejs/path'
import { get } from '@/shared/lodash'
import type { StrMap } from '@/shared/ts-utils'

export class ResolveClientExtension {
  alias: StrMap<string>
  clients: StrMap<true>
  constructor(dir: string, clients: string[]) {
    this.alias = getAlias(dir)
    this.clients = clients.reduce<StrMap<true>>((m, a) => {
      m[a] = true
      return m
    }, {})
  }

  apply = (resolver: Resolver) => {
    const target = resolver.ensureHook('resolve')

    resolver
      .getHook('beforeResolve')
      .tapAsync('ClientExtensionResolver', (req, ctx, callback) => {
        try {
          const currentFilename = get(req.context, 'issuer')
          let importPath = req.request
          if (!currentFilename || !importPath) {
            return callback()
          }

          if (!shouldTranspile(importPath)) {
            return callback()
          }

          if (!isRelative(importPath)) {
            importPath = path
              .relative(currentFilename, importPath)
              .replace(shouldTranspileExtension, '')
          }

          const clientVariant = getClientVariant({
            alias: this.alias,
            clients: this.clients,
            currentFilename,
            importPath,
          })
          if (!clientVariant) {
            return callback()
          }

          resolver.doResolve(
            target,
            {
              ...req,
              request: clientVariant,
            },
            'ClientExtensionResolver',
            ctx,
            callback,
          )
        } catch (err) {
          callback(err as Error)
        }
      })
  }
}
