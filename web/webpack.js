const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const json5 = require('json5');

const cwd = process.cwd();

module.exports = {
  entry: ['babel-polyfill', path.join(cwd, 'index.web.js')],
  output: {
    filename: 'bundle.web.js',
    path: path.join(cwd, 'dist/web'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          // The main source folder for js code:
          path.join(cwd, './app'),
          path.join(cwd, './index.web.js'),
          // Other node modules need to be transpiled:
          path.join(cwd, './node_modules/jssip'),
          /react-native.+/,
          /react-.+native/,
          /rn-.+/,
        ],
        use: {
          loader: 'babel-loader',
          options: {
            ...json5.parse(fs.readFileSync(path.join(cwd, '.babelrc'))),
            presets: ['env', 'react'],
            cacheDirectory: true,
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
        test: /\.(woff|woff2|eot|svg|ttf)(\?*)?$/,
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
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, './index.html') },
      { from: path.resolve(__dirname, './favicon.png') },
    ]),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.js', '.js'],
  },
  devServer: {
    contentBase: path.join(cwd, 'web'),
  },
  devtool: 'inline-source-map',
};
