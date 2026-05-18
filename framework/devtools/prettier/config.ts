import type { Config } from 'prettier'

export const config: Config = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  requirePragma: false,
  insertPragma: false,
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'ignore',
  plugins: [
    require.resolve('prettier-plugin-tailwindcss'),
    require.resolve('@prettier/plugin-xml'),
  ],
  tailwindFunctions: ['tw', 'cva', 'clsx'],
  xmlQuoteAttributes: 'double',
  xmlSelfClosingSpace: true,
  xmlSortAttributesByKey: true,
  xmlWhitespaceSensitivity: 'ignore',
}
