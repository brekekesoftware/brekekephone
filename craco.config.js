const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
  babel: {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-transform-modules-commonjs', { loose: true }],
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-transform-flow-strip-types',
      '@babel/plugin-transform-react-jsx',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-export-namespace-from',
    ],
    loaderOptions: {
      exclude: /node_modules\/(?!react-native|native-base).*(node_modules|dist)/,
    },
  },
  webpack: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-svg': 'react-native-svg-web',
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
