module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: 'react-app',
  plugins: ['import', 'simple-import-sort'],
  rules: {
    curly: [2, 'all'],
    semi: [2, 'never'],
    quotes: [2, 'single', { avoidEscape: true }],
    'sort-imports': 'off',
    'simple-import-sort/sort': 2,
    'import/first': 2,
    'import/newline-after-import': 2,
    'import/no-duplicates': 2,
    'import/no-extraneous-dependencies': 2,
  },
}
