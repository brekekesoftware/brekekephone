// reexport config at root to be compatible with vscode intellisense

require('./devtools-register')
module.exports = require('@/devtools/eslint/config').config({
  dir: __dirname,
})
