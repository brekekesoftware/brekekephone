const CircularDependencyPlugin = require(`circular-dependency-plugin`);

const babelPluginIntl = require(`./babelPluginIntl`);

module.exports = {
  babel: {
    plugins: [
      babelPluginIntl,
      [`@babel/plugin-proposal-decorators`, { legacy: true }],
      [`@babel/plugin-proposal-class-properties`, { loose: true }],
      [`@babel/plugin-transform-modules-commonjs`, { loose: true }],
      `@babel/plugin-proposal-optional-chaining`,
      `@babel/plugin-proposal-throw-expressions`,
      `@babel/plugin-transform-flow-strip-types`,
      `@babel/plugin-transform-react-jsx`,
      `@babel/plugin-proposal-export-default-from`,
      `@babel/plugin-proposal-export-namespace-from`,
    ],
    loaderOptions: {
      exclude: /node_modules\/(?!react-native).*(node_modules|dist)/,
    },
  },
  webpack: {
    alias: {
      '@react-native-community/async-storage': `@callstack/async-storage`,
      'react-native': `react-native-web`,
      'react-native-fast-image': `react-native-web/dist/exports/Image`,
      'react-native-linear-gradient': `react-native-web-linear-gradient`,
      'react-native-svg': `react-native-svg-web`,
    },
    configure: {
      resolve: {
        extensions: [
          // Try to resolve `.web.js` before `.js`
          `.web.js`,
          `.js`,
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
