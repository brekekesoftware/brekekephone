module.exports = {
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'eslint-plugin-import',
    'eslint-plugin-prefer-arrow',
    'eslint-plugin-react',
    'eslint-plugin-simple-import-sort',
  ],
  rules: {
    // ---------------------------------------------------------------------
    // fixable rules

    // common
    curly: [1, 'all'],
    quotes: [1, 'single', { avoidEscape: true }],
    semi: [1, 'never'],
    'arrow-body-style': [1, 'as-needed'],
    'no-useless-rename': 1,
    'object-shorthand': [1, 'always'],
    'one-var': [1, 'never'],
    'prefer-const': 1,
    'react/jsx-no-useless-fragment': 1,
    'spaced-comment': [1, 'always'],

    // import - sort import
    'sort-imports': 0,
    'import/order': 0,
    'simple-import-sort/imports': [
      1,
      {
        groups: [
          ['^\\u0000'],
          ['^@?\\w'],
          ['\\.(s?css|svg|png|jpe?g|gif)$'],
          ['^[^.]'],
          ['^\\.'],
        ],
      },
    ],
    'simple-import-sort/exports': 1,
    'import/first': 1,
    'import/newline-after-import': 1,
    'import/no-duplicates': 1,
    'import/no-extraneous-dependencies': 1,

    // import type { ... } from
    '@typescript-eslint/consistent-type-imports': 1,
    '@typescript-eslint/no-import-type-side-effects': 1,
    'import/consistent-type-specifier-style': [1, 'prefer-top-level'],

    // compatible with prettier
    '@typescript-eslint/member-delimiter-style': [
      1,
      {
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
        multiline: {
          delimiter: 'none',
          requireLast: true,
        },
      },
    ],

    // ---------------------------------------------------------------------
    // non-fixable rules

    // common
    'no-return-assign': 1,

    // must use arrow functions
    'prefer-arrow/prefer-arrow-functions': [
      1,
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: true,
      },
    ],
    'prefer-arrow-callback': [1, { allowNamedFunctions: true }],
    'func-style': [1, 'expression', { allowArrowFunctions: true }],

    // compatible with typescript
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': [1, { args: 'none' }],
    'no-shadow': 0,
    '@typescript-eslint/no-shadow': 1,

    // restrict export default
    'no-restricted-syntax': [
      1,
      {
        selector: 'ExportDefaultDeclaration',
        message: 'Prefer named exports',
      },
    ],
  },
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['plugin:react/jsx-runtime'],
  env: {
    browser: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
