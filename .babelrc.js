const intlBabelPlugin = require('./.intlBabelPlugin')

module.exports = {
  presets: [
    [
      'module:metro-react-native-babel-preset',
      { useTransformReactJSXExperimental: true },
    ],
  ],
  plugins: [
    intlBabelPlugin,
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-optional-chaining',
  ],
}
