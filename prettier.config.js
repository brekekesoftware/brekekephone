// reexport config at root to be compatible with vscode intellisense
require('./devtools-register')
module.exports = require('@rntwsc/devtools/prettier/config').config
