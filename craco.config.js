const path = require('path')
const CircularDependencyPlugin = require('circular-dependency-plugin')

const babelPluginIntl = require('./babelPluginIntl')

const nullAlias = path.join(__dirname, './src/null.ts')

module.exports = {
  babel: {
    plugins: [
      babelPluginIntl,
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-transform-modules-commonjs', { loose: true }],
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-transform-react-jsx',
    ],
    loaderOptions: {
      exclude: /node_modules\/(?!react-native).*(node_modules|dist)/,
    },
  },
  webpack: {
    alias: {
      '@react-native-community/async-storage': '@callstack/async-storage',
      'react-native': 'react-native-web',
      'react-native-fast-image': 'react-native-web/dist/exports/Image',
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
      'react-native-svg': 'react-native-svg-web',
      'react-native-uuid': 'uuid',
      'react-native-callkeep': nullAlias,
      'react-native-fs': nullAlias,
      'react-native-incall-manager': nullAlias,
      'react-native-share': nullAlias,
      'react-native-splash-screen': nullAlias,
    },
    configure: {
      resolve: {
        extensions: [
          // Try to resolve `.web.*` first
          '.web.js',
          '.web.ts',
          '.web.tsx',
          '.js',
          '.ts',
          '.tsx',
        ],
      },
    },
    plugins: [
      new CircularDependencyPlugin({
        exclude: /node_modules/,
      }),
    ],
  },
}
