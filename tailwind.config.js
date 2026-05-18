// reexport config at root to be compatible with vscode intellisense

require('./devtools-register')
const { mergeWithArray } = require('@/shared/lodash')

module.exports = mergeWithArray(
  {},
  require('@/rn/core/tw-config').twConfig,
  require('@/rn/core/twrnc-config').twrncConfig,
)
