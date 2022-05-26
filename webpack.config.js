const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const craco = require('./.cracorc')

const j = d => path.join(__dirname, d)

module.exports = {
  entry: [
    //
    j('./src/asComponent'),
    j('./src/asComponent/example.html'),
  ],
  output: {
    path: j('./build/component'),
    filename: 'brekeke-phone-component.js',
    publicPath: './',
  },
  resolve: {
    extensions: craco.webpack.configure.resolve.extensions,
    alias: craco.webpack.alias,
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        loader: 'babel-loader',
        options: {
          ...craco.babel,
          include: [
            j('./src'),
            j('./node_modules/@react-native-community/push-notification-ios'),
            j('./node_modules/react-native-emoji-selector'),
            j('./node_modules/react-native-keyboard-spacer'),
          ],
        },
      },
      {
        test: /\.(png|jpe?g|gif|mp3)$/i,
        loader: 'file-loader',
        options: {
          outputPath: 'assets',
        },
      },
      {
        test: /\.html$/,
        loader: 'file-loader',
        options: {
          name: '[name].html',
        },
      },
    ],
  },
  plugins: [
    //
    ...craco.webpack.plugins,
    new CleanWebpackPlugin(),
  ],
  mode: 'production',
  stats: 'minimal',
  performance: {
    hints: false,
  },
}
