module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: 'react-app',
  plugins: ['import', 'simple-import-sort'],
  rules: {
    quotes: [2, 'single'],
    'sort-imports': 'off',
    'simple-import-sort/sort': 2,
    'import/first': 2,
    'import/newline-after-import': 2,
    'import/no-duplicates': 2,
    'import/no-extraneous-dependencies': 2,
  },
}
