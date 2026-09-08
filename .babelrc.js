const intlBabelPlugin = require('./.intlBabelPlugin')

/** @typedef {import('@babel/core').PluginTarget} PluginTarget */
const fs = require('node:fs')
const json5 = require('json5')
const path = require('node:path')

const cwd = process.cwd()
const tsconfigPath = path.join(cwd, 'tsconfig.json')
const tsconfigFile = fs.readFileSync(tsconfigPath, 'utf-8')

const tsconfig = json5.parse(tsconfigFile)
/** @type {{ [k: string]: string[] }} */
const paths = tsconfig.compilerOptions.paths

/** @type {{ [k: string]: string }} */
const alias = Object.entries(paths).reduce((m, a) => {
  const [k, v] = [a[0], a[1][0]].map(_ => _.replace(/\/\*$/, ''))
  // TODO: react native can not resolve absolute paths
  // m[k] = path.join(cwd, v)
  m[k] = v
  return m
}, {})

/** @type {(p: string) => PluginTarget} */
const es6 = p => {
  const m = require(p)
  return 'default' in m ? m.default : m
}
const moduleResolverBabelPlugin = [
  es6('babel-plugin-module-resolver'),
  { alias },
]

module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset',
      { useTransformReactJSXExperimental: true },
    ],
  ],
  plugins: [
    moduleResolverBabelPlugin,
    intlBabelPlugin,

    // https://github.com/facebook/react-native/issues/36828#issuecomment-1589462227
    '@babel/plugin-transform-flow-strip-types',

    '@babel/plugin-proposal-optional-chaining',
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
    ['@babel/plugin-transform-class-properties', { loose: true }],

    // fix warnings
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
  ],
}
