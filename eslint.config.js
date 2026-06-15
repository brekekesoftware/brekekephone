// reexport config at root to be compatible with vscode intellisense
require('./devtools-register')

module.exports = require('@rntwsc/devtools/eslint/config').config({
  dir: __dirname,
  alias: true,
  overriddenRules: {
    'custom/enforce-use-client': 0,
    'custom/err-name': 0,
    'custom/kebab-case-import-paths': [
      1,
      {
        skip: /\.(mp3|png)$/.source,
      },
    ],
    'custom/no-import-invalid-variant': 0,
    'custom/no-missing-export': 0,
    'custom/no-nullish-coalescing': 0,
    'no-restricted-imports': 0,
    'react/destructuring-assignment': 0,
  },
})
