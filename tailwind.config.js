// reexport config at root to be compatible with vscode intellisense
require('./devtools-register')
const { mergeWithArray } = require('@rntwsc/shared/lodash')

module.exports = mergeWithArray(
  {},
  require('@rntwsc/rn/core/tw-config').twConfig,
  require('@rntwsc/rn/core/twrnc-config').twrncConfig,
)
