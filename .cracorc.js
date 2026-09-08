const path = require('path')
const CircularDependencyPlugin = require('circular-dependency-plugin')

const babel = require('./.babelrc')

const nullAlias = path.join(__dirname, './src/polyfill/null.ts')

module.exports = {
  babel,
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
