// For react-native code

const intlBabelPlugin = require('./.intlBabelPlugin')

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    intlBabelPlugin,
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-optional-chaining',
  ],
}
