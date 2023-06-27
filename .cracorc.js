const path = require('path')
const CircularDependencyPlugin = require('circular-dependency-plugin')

const babel = require('./.babelrc')

const nullAlias = path.join(__dirname, './src/polyfill/null.ts')

module.exports = {
  babel,
  webpack: {
    configure: c => {
      c.resolve.alias = {
        tslib: nullAlias,
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
      c.plugins.push(
        new CircularDependencyPlugin({
          exclude: /node_modules/,
        }),
      )
      //
      // disable esm
      c.resolve.mainFields = ['browser', 'main']
      const rules = [c.module.rules[0], ...c.module.rules[1].oneOf]
      rules.forEach(c => {
        if (!c.test) {
          return
        }
        const p = /\/(.*)\/(.*)/.exec(c.test.toString())
        c.test = new RegExp(p[1].replace('|mjs', ''), p[2])
      })
      return c
    },
  },
  typescript: {
    enableTypeChecking: false,
  },
}
