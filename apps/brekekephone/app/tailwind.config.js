require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  dir: __dirname,
})
const { mergeWithArray } = require('@/shared/lodash')

module.exports = mergeWithArray(
  {},
  // doesnt work with # in this case
  // need to use relative imports
  require('./src/tw-config').twConfig,
  require('./src/twrnc-config').twrncConfig,
)
