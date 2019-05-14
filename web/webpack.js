const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const rootDir = path.join(__dirname, '../');
const isProd = process.env.NODE_ENV === 'production';

// https://webpack.js.org/configuration/stats/
const stats = {
  modules: false,
};

module.exports = {
  entry: {
    main: [
      // js-import-sort doesn't sort it properly
      //    if we place the polyfill in the index.web.js
      '@babel/polyfill',
      path.join(rootDir, 'index.web.js'),
    ],
  },
  output: {
    filename: 'bundle.web.js',
    path: path.join(rootDir, 'build/web'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          // The main source folder for js code:
          path.join(rootDir, './app'),
          path.join(rootDir, './index.web.js'),
          // Other node modules need to be transpiled:
          path.join(rootDir, './node_modules/jssip'),
          /react-native.+/,
          /react-.+native/,
        ],
        use: {
          loader: 'babel-loader',
          // Override the root config .babelrc.js
          options: {
            presets: [
              //
              '@babel/preset-env',
              '@babel/preset-react',
            ],
            plugins: [
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              '@babel/plugin-proposal-object-rest-spread',
            ],
          },
        },
      },
      {
        test: /\.(gif|jpe?g|png|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff2?|eot|svg|ttf)(\?*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: './fonts/[name].[ext]',
          },
        },
      },
      {
        test: /\.(mp3)(\?*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: './sounds/[name].[ext]',
          },
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin(
      [
        // root assets to be copied
        './index.html',
        './favicon.ico',
      ].map(p => ({
        from: path.resolve(__dirname, p),
      })),
    ),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: [
      // Add .web.js first to resolve
      '.web.js',
      '.js',
    ],
  },
  performance: {
    hints: false,
  },
  devServer: {
    contentBase: path.join(rootDir, 'web'),
    stats,
  },
  devtool: isProd ? false : 'source-map',
  stats,
};
