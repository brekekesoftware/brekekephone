const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const dev = process.NODE_ENV !== 'production'
const abspath = (relpath) => path.resolve(__dirname, relpath)

const babelLoader = {
  test: /\.js$/,
  include: [
    /app/,
    /node_modules\/react-native-/,
    /node_modules\/react-router/
  ],
  exclude: [
    /node_modules\/react-native-web/
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets: [
        ['env', {
          target: {
            browsers: [
              'last 5 versions',
              'safari >= 7'
            ]
          }
        }]
      ],
      plugins: [
        'transform-class-properties'
      ]
    }
  }
}

const imageLoader = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]'
    }
  }
}

const cssLoader = {
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader'
  ]
}

const fontLoader = {
  test: /\.(woff|woff2|eot|svg|ttf)(\?*)?$/,
  use: {
    loader: 'file-loader',
    options: {
      name: './fonts/[name].[ext]'
    }
  }
}

const soundLoader = {
  test: /\.(mp3)(\?*)?$/,
  use: {
    loader: 'file-loader',
    options: {
      name: './sounds/[name].[ext]'
    }
  }
}

const plugins = [
  new CopyWebpackPlugin([
    {from: path.resolve(__dirname, './index.html')},
    {from: path.resolve(__dirname, './jssip-0.7.11-1.js')},
    {from: path.resolve(__dirname, './favicon.png')}
  ])
]

module.exports = {
  entry: [
    'babel-polyfill',
    abspath('../index.web.js')
  ],
  //devtool: dev ? 'eval' : false,
  devtool: 'inline-source-map',
  
  module: {
    rules: [
      babelLoader,
      imageLoader,
      cssLoader,
      fontLoader,
      soundLoader
    ]
  },
  output: {
    filename: 'bundle.web.js',
    path: abspath('../dist/web')
  },
  plugins,
  resolve: {
    alias: {
      'react-native': 'react-native-web'
    },
    extensions: [
      '.web.js',
      '.js'
    ]
  },
  devServer: {
    contentBase: abspath('./')
  }
}
