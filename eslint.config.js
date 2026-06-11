// reexport config at root to be compatible with vscode intellisense

require('./devtools-register')
module.exports = require('@/devtools/eslint/config').config({
  dir: __dirname,
  alias: true,
  ignoreFramework: true,
  overriddenRules: {
    'custom/enforce-use-client': 0,
    'custom/err-name': 0,
    'custom/no-import-invalid-variant': 0,
    'custom/no-nullish-coalescing': 0,
    'react/destructuring-assignment': 0,
  },
})
