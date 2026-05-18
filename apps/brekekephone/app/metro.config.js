// react native metro doesnt support typescript in this file
// we need to use js here

require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  dir: __dirname,
})

const config = require('@/devtools/metro-config').config({
  dir: __dirname,
})

module.exports = config

const { path } = require('@/nodejs/path')
const { fs } = require('@/nodejs/fs')

const polyfill = k => path.join(__dirname, `./src/polyfill/${k}.ts`)
const nullPolyfill = polyfill('null')

const alias = [
  'react-native-reanimated',
  'react-native-css-animations',
  'react-native-mmkv',
].reduce((m, k) => {
  let v = polyfill(k)
  if (!fs.existsSync(v)) {
    v = nullPolyfill
  }
  m[k] = v
  return m
}, {})

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
