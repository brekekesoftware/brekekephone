require('@rntwsc/nodejs/entrypoint')({
  target: __dirname,
})

const config = require('@rntwsc/devtools/metro-config').config({
  dir: __dirname,
})

module.exports = config

const { path } = require('@rntwsc/nodejs/path')
const { fs } = require('@rntwsc/nodejs/fs')

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
