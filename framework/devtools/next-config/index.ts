import type { NextConfig } from 'next'

import { shouldTranspileExtension } from '@/devtools/babel-config/should-transpile'
import { getAlias } from '@/devtools/ts/get-alias'
import { cssVariablesFilenameRegex } from '@/devtools/webpack-css-variables/transform-css-variables'
import { ResolveClientExtension } from '@/devtools/webpack-resolve-client-extension'
import { glob } from '@/nodejs/glob'
import { repoRoot } from '@/root'
import { jsonSafe } from '@/shared/json-safe'

const resolveAlias = {
  'next-unchecked/headers': '@/rn/core/polyfill/next/headers',
  'next-unchecked/navigation': '@/rn/core/polyfill/next/navigation',
  'react-native': 'react-native-web',
  'react-native-svg': 'react-native-svg-web',
}

type Options = {
  dir: string
}

export const config = async (o: Options): Promise<NextConfig> => ({
  ...(await webpack(o)),
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  reactStrictMode: false,
  output: 'standalone',
  outputFileTracingRoot: repoRoot,
})

const webpack = async (o: Options): Promise<NextConfig> => {
  const alias = getAlias(o.dir)
  const clients = await glob('**/*.client.{ts,tsx}')
  const cssVariablesLoader = require.resolve('@/devtools/webpack-css-variables')

  return {
    webpack: (c, { isServer }) => {
      c.resolve.alias = {
        ...c.resolve.alias,
        ...resolveAlias,
      }

      traverseWebpackRule(c.module.rules)

      // css extract variables
      c.module.rules.unshift({
        test: cssVariablesFilenameRegex,
        type: 'javascript/auto',
        use: {
          loader: cssVariablesLoader,
        },
      })

      // svg to react component
      c.module.rules.push({
        test: /\.svg$/,
        use: {
          loader: '@svgr/webpack',
          options: {
            dimensions: false,
          },
        },
      })

      if (!isServer) {
        c.resolve.plugins = c.resolve.plugins || []
        c.resolve.plugins.push(new ResolveClientExtension(o.dir, clients))

        // since the loader is cached
        // we can not use one babel loader for both client and server code
        // nextjs uses a different builtin babel loader
        // we will use this loader to handle client-only code
        c.module.rules.push({
          test: shouldTranspileExtension,
          use: {
            loader: 'babel-loader',
            options: {
              caller: {
                isServer,
                clientOnly: true,
                alias: jsonSafe(alias),
                clients: jsonSafe(clients),
              },
            },
          },
        })
      }

      return c
    },
  }
}

const traverseWebpackRule = (rule: any): any => {
  if (!rule || typeof rule !== 'object') {
    return rule
  }

  if (Array.isArray(rule)) {
    return rule.map(traverseWebpackRule).filter(v => v)
  }

  for (const [k, v] of Object.entries(rule)) {
    // since the loader is cached
    // we can not use one babel loader for both client and server code
    // thus can not remove nextjs built in babel loader
    // // remove babel loader since we already have above
    // if (typeof v === 'string' && /babel[/-]loader/.test(v)) {
    //   return
    // }

    // exclude css extract variables
    if (
      k === 'test' &&
      typeof v === 'object' &&
      v?.toString().includes('\\.css')
    ) {
      rule.exclude = rule.exclude || []
      if (Array.isArray(rule.exclude)) {
        rule.exclude.push(cssVariablesFilenameRegex)
      } else {
        rule.exclude = [rule.exclude, cssVariablesFilenameRegex]
      }
    }

    // already filtered out, remove this rule
    if (k === 'use' && !v) {
      return
    }

    rule[k] = traverseWebpackRule(v)
  }

  return rule
}
