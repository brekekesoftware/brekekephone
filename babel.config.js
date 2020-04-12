// For react-native code

const babelPluginIntl = require('./babelPluginIntl')

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    babelPluginIntl,
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-optional-chaining',
  ],
}
