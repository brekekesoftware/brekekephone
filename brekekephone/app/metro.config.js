require('tsx/cjs')

const { path } = require('rntwsc/devtools/path')
const { fs } = require('rntwsc/devtools/fs')

const config = require('rntwsc/devtools/metro-config').config({
  dir: __dirname,
  repoRoot: path.join(__dirname, '../../'),
})

module.exports = config

const polyfill = k => path.join(__dirname, `./src/polyfill/${k}.ts`)
const nullPolyfill = polyfill('null')

const alias = ['react-native-reanimated', 'react-native-css-animations'].reduce(
  (m, k) => {
    let v = polyfill(k)
    if (!fs.existsSync(v)) {
      v = nullPolyfill
    }
    m[k] = v
    return m
  },
  {},
)

const resolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (alias[moduleName]) {
    return {
      type: 'sourceFile',
      filePath: alias[moduleName],
    }
  }
  return resolveRequest(context, moduleName, platform)
}
