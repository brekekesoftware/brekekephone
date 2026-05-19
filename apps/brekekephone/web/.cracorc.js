require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  dir: __dirname,
})

const path = require('node:path')
const CircularDependencyPlugin = require('circular-dependency-plugin')
const { getAlias } = require('@/devtools/ts/get-alias')

const babel = require('../app/.babelrc')

babel.plugins.push('@babel/plugin-transform-typescript')
babel.plugins.forEach(p => {
  if (!Array.isArray(p)) {
    return
  }
  if (typeof p[0] !== 'string') {
    return
  }
  if (!p[0].includes('module-resolver')) {
    return
  }
  p[1].alias = getAlias(__dirname, {
    relative: true,
  })
})

const nullAlias = path.join(__dirname, '../app/src/polyfill/null.ts')

module.exports = {
  webpack: {
    configure: c => {
      c.resolve.alias = {
        'react-native': 'react-native-web',
        'react-native-fast-image': 'react-native-web/dist/exports/Image',
        'react-native-linear-gradient': 'react-native-web-linear-gradient',
        'react-native-svg': 'react-native-svg-web',
        'react-native-callkeep': nullAlias,
        'react-native-fs': nullAlias,
        'react-native-incall-manager': nullAlias,
        'react-native-share': nullAlias,
        'react-native-splash-screen': nullAlias,
        'react-native-background-timer': nullAlias,
        '@react-native-documents/picker': nullAlias,
      }
      c.resolve.fallback = {
        os: false,
        tty: false,
      }
      c.resolve.extensions = [
        // try to resolve `.web.*` first
        '.web.js',
        '.web.ts',
        '.web.tsx',
        '.js',
        '.ts',
        '.tsx',
      ]

      // allow import outside of src
      c.resolve.plugins = c.resolve.plugins.filter(
        p => p.constructor.name !== 'ModuleScopePlugin',
      )
      // disable esm mjs
      disableEsm(c)

      // extra plugins
      c.plugins.push(
        new CircularDependencyPlugin({
          exclude: /node_modules/,
        }),
      )

      // remove obsolete rules
      traverseWebpackRule(c.module.rules)

      // custom babel loader
      c.module.rules.push({
        test: r => {
          if (
            /\.tsx?/.test(r) ||
            /brekekejs/.test(r) ||
            r.includes('push-notification-ios')
          ) {
            return true
          }
          return false
        },
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            ...babel,
          },
        },
      })

      // custom postcss loader
      c.module.rules.push({
        test: /\.css$/,
        use: {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: {
                '@tailwindcss/postcss': {},
                autoprefixer: {},
              },
            },
          },
        },
      })

      return c
    },
  },
  typescript: {
    enableTypeChecking: false,
  },
}

const disableEsm = c => {
  c.resolve.mainFields = [
    // do not use esm "exports"
    'browser',
    'main',
  ]
  // get rules from webpack with .test regex
  const rules = []
  const pushRule = r => {
    if (r.test instanceof RegExp) {
      rules.push(r)
    }
    if (Array.isArray(r.oneOf)) {
      r.oneOf.forEach(pushRule)
    }
    if (Array.isArray(r.rules)) {
      r.rules.forEach(pushRule)
    }
  }
  c.module.rules.forEach(pushRule)
  // modify the .test regex of those rules to remove esm extensions
  rules.forEach(r => {
    const [, source, flags] = /\/(.*)\/(.*)/.exec(r.test.toString())
    const newSource = ['mjs'].reduce(
      (s, e) => s.replace(`|${e}`, '').replace(`${e}|`, '').replace(e, ''),
      source,
    )
    r.test = newSource ? new RegExp(newSource, flags) : /.^/
  })
}

const traverseWebpackRule = rule => {
  if (!rule || typeof rule !== 'object') {
    return rule
  }

  if (Array.isArray(rule)) {
    return rule.map(traverseWebpackRule).filter(v => v)
  }

  for (const [k, v] of Object.entries(rule)) {
    if (typeof v === 'string' && /babel[/-]loader/.test(v)) {
      return
    }
    if (typeof v === 'string' && /postcss[/-]loader/.test(v)) {
      return
    }

    // already filtered out, remove this rule
    if (k === 'use' && !v) {
      return
    }

    rule[k] = traverseWebpackRule(v)
  }

  return rule
}
