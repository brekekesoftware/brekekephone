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
    '@babel/plugin-proposal-optional-chaining',
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
    ['@babel/plugin-transform-class-properties', { loose: true }],
    // fix warnings
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    // https://github.com/facebook/react-native/issues/36828#issuecomment-1589462227
    '@babel/plugin-transform-flow-strip-types',
  ],
}
