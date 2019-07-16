const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
  babel: {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { legacy: true }],
    ],
    loaderOptions: {
      include: [
        // The main source directory:
        path.join(__dirname, './src'),
        // Other node modules need to be transpiled:
        path.join(__dirname, './node_modules/jssip'),
        /react-native.+/,
        /react-.+native/,
      ],
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
