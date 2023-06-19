module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: 'plugin:react-app/recommended',
  plugins: ['@typescript-eslint', 'import', 'simple-import-sort'],
  env: {
    browser: true,
    node: true,
  },
  rules: {
    // Fixable rules
    curly: [1, 'all'],
    semi: [1, 'never'],
    quotes: [1, 'single', { avoidEscape: true }],
    'one-var': [1, 'never'],
    'sort-imports': 0,
    'import/order': 0,
    'simple-import-sort/imports': 1,
    'simple-import-sort/exports': 1,
    'import/first': 1,
    'import/newline-after-import': 1,
    'import/no-duplicates': 1,
    'import/no-extraneous-dependencies': 1,
    // Compatible with prettier
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
    // Some other rules
    'react-app/react/react-in-jsx-scope': 0,
    'prefer-const': 1,
    'import/no-default-export': 1,
    'object-shorthand': [1, 'always'],
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': [1, { args: 'none' }],
    'no-shadow': 0,
    '@typescript-eslint/no-shadow': 1,
    'no-unused-expressions': 0,
    '@typescript-eslint/no-unused-expressions': 1,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
