require('tsx/cjs')

const { getAlias } = require('rntwsc/devtools/babel-config/get-alias')
const { twPlugin } = require('rntwsc/devtools/babel-plugin-tw')
const { asyncHookPlugin } = require('rntwsc/devtools/babel-plugin-async-hook')
const { twrncConfig } = require('#/twrnc-config')

const twOptions = {
  reactNativeVersion: require('./package.json').dependencies['react-native'],
  twrncConfig,
  extractClassNameOutputPath: __dirname,
}
const isServerOptions = {
  isServer: false,
}
const moduleResolverOptions = {
  alias: getAlias(__dirname, {
    relative: true,
  }),
}

module.exports = {
  plugins: [
    [asyncHookPlugin, isServerOptions],
    [twPlugin, twOptions],

    require.resolve('./intl-babel-plugin'),

    ['babel-plugin-module-resolver', moduleResolverOptions],

    '@babel/plugin-proposal-optional-chaining',
    [
      '@babel/plugin-transform-class-properties',
      {
        loose: true,
      },
    ],
    // fix some packages in node_modules still have jsx
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
      },
    ],
  ],
  presets: [
    [
      '@react-native/babel-preset',
      {
        useTransformReactJSXExperimental: true,
      },
    ],
  ],
  compact: false,
}
