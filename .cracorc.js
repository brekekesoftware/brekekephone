const path = require('path')
const CircularDependencyPlugin = require('circular-dependency-plugin')

const babel = require('./.babelrc')

const nullAlias = path.join(__dirname, './src/polyfill/null.ts')

module.exports = {
  babel,
  webpack: {
    alias: {
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
