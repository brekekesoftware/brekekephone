// reexport config at root to be compatible with vscode intellisense
require('./devtools-register')

module.exports = require('@rntwsc/devtools/eslint/config').config({
  dir: __dirname,
  alias: true,
  overriddenRules: {
    'custom/enforce-use-client': 0,
    'custom/err-name': 0,
    'custom/no-import-invalid-variant': 0,
    'custom/no-missing-export': 0,
    'custom/no-nullish-coalescing': 0,
    'import/no-extraneous-dependencies': [
      1,
      {
        ignore: [
          'tsconfig-paths',
          'json5',
          'typescript',
          '@rntwsc/shared',
          '@rntwsc/nodejs',
          '@rntwsc/rn',
          '@rntwsc/devtools',
        ],
        includeTypes: true,
      },
    ],
    'no-restricted-imports': 0,
    'react/destructuring-assignment': 0,
  },
})
