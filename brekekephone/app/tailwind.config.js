require('@rntwsc/nodejs/entrypoint')({
  target: __dirname,
})
const { mergeWithArray } = require('@rntwsc/shared/lodash')

module.exports = mergeWithArray(
  {},
  // doesnt work with # in this case
  // need to use relative imports
  require('./src/tw-config').twConfig,
  require('./src/twrnc-config').twrncConfig,
)
