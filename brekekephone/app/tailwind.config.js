require('tsx/cjs')
const { mergeWithArray } = require('rntwsc/libs/lodash')

module.exports = mergeWithArray(
  {},
  // doesnt work with # in this case
  // need to use relative imports
  require('@/tw-config').twConfig,
  require('@/twrnc-config').twrncConfig,
)
