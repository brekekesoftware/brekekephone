const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
  babel: {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-transform-react-jsx',
    ],
    loaderOptions: {
      exclude: /node_modules\/(?!react-native-).*/,
    },
  },
  webpack: {
    alias: {
      'react-native': 'react-native-web',
    },
    configure: {
      resolve: {
        extensions: [
          // Add .web.js first to resolve
          '.web.js',
          '.js',
        ],
      },
    },
    plugins: [
      new CircularDependencyPlugin({
        exclude: /node_modules/,
      }),
    ],
  },
};
