// metro can not resolve typescript
// we need to have this file as cjs

require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  dir: __dirname,
})
module.exports = require('./transformer-ts')
