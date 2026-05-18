// nextjs doesnt support typescript mix with cjs
// we need to use js here

require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  dir: __dirname,
})
const { mergeWithArray } = require('@/shared/lodash')

module.exports = mergeWithArray(
  {},
  require('#/tw-config').twConfig,
  require('#/twrnc-config').twrncConfig,
)
