require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  dir: __dirname,
})

const { twPlugin } = require('@/devtools/babel-plugin-tw')
const { asyncHookPlugin } = require('@/devtools/babel-plugin-async-hook')
const { getAlias } = require('@/devtools/ts/get-alias')
const { twrncConfig } = require('#/twrnc-config')

const twOptions = {
  twrncConfig,
  extractOutputPath: __dirname,
}
const asyncHookOptions = {
  isServer: false,
}
const moduleResolverOptions = {
  alias: getAlias(__dirname, {
    relative: true,
  }),
}

module.exports = {
  plugins: [
    [asyncHookPlugin, asyncHookOptions],
    [twPlugin, twOptions],

    require.resolve('./.intlBabelPlugin'),

    ['babel-plugin-module-resolver', moduleResolverOptions],

    '@babel/plugin-proposal-optional-chaining',
    ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
    ['@babel/plugin-transform-class-properties', { loose: true }],
    // fix some packages in node_modules still have jsx
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
  ],
  presets: [
    ['@react-native/babel-preset', { useTransformReactJSXExperimental: true }],
  ],
  compact: false,
}
