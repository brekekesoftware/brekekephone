// reexport config at root to be compatible with vscode intellisense
require('tsx/cjs')
const { mergeWithArray } = require('rntwsc/libs/lodash')

module.exports = mergeWithArray(
  {},
  require('rntwsc/tw/tailwind-config').config,
  require('rntwsc/tw/twrnc-config').twrncConfig,
)
