import 'eslint-plugin-only-warn'

import { includeIgnoreFile } from '@eslint/compat'
import pluginTs from '@typescript-eslint/eslint-plugin'
import * as tsParser from '@typescript-eslint/parser'
import * as pluginImport from 'eslint-plugin-import'
import pluginImportAbsolute from 'eslint-plugin-no-relative-import-paths'
import pluginPreferArrow from 'eslint-plugin-prefer-arrow'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReactRefresh from 'eslint-plugin-react-refresh'
import pluginImportSort from 'eslint-plugin-simple-import-sort'
import pluginUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import { globbySync } from 'globby'
import fs from 'node:fs'
import path from 'node:path'
import type { ConfigWithExtends } from 'typescript-eslint'
import tseslint from 'typescript-eslint'

const off = 0 as const
const warn = 1 as const
const repoRoot = import.meta.dirname

const gitignorePath = path.join(repoRoot, '.gitignore')
const gitignore = includeIgnoreFile(gitignorePath)

const tsExts = 'ts,tsx'
const jsExts = 'js,jsx,cjs,mjs'

const jsShadowed = globbySync(`**/*.{${jsExts}}`, {
  gitignore: true,
  onlyFiles: true,
}).filter(p =>
  tsExts.split(',').some(e => fs.existsSync(p.replace(/\.\w+$/, `.${e}`))),
)
const base: ConfigWithExtends = {
  files: [`**/*.{${tsExts},${jsExts}}`],
  ignores: [
    // match with prettier ignore and tsconfig exclude
    '**/*.min.*',
    // js files that are shadowed by ts
    ...jsShadowed,
  ],
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  linterOptions: {
    reportUnusedDisableDirectives: true,
  },
  plugins: {
    '@typescript-eslint': pluginTs,
    react: pluginReact,
    'react-hooks': pluginReactHooks,
    'react-refresh': pluginReactRefresh,
    import: pluginImport,
    'simple-import-sort': pluginImportSort,
    'no-relative-import-paths': pluginImportAbsolute,
    'prefer-arrow': pluginPreferArrow,
    unicorn: pluginUnicorn,
  },
  rules: {
    curly: [warn, 'all'],
    quotes: [warn, 'single', { avoidEscape: true }],
    semi: [warn, 'never'],
    'arrow-body-style': [warn, 'as-needed'],
    'no-useless-rename': warn,
    'object-shorthand': [warn, 'always'],
    'one-var': [warn, 'never'],
    'prefer-const': warn,
    'react/jsx-no-useless-fragment': warn,
    'spaced-comment': [warn, 'always', { markers: ['/'] }],

    'import/first': warn,
    'import/newline-after-import': warn,
    'import/no-duplicates': warn,

    'simple-import-sort/imports': [
      warn,
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
    'simple-import-sort/exports': warn,

    'import/consistent-type-specifier-style': [warn, 'prefer-top-level'],
    '@typescript-eslint/consistent-type-imports': warn,
    '@typescript-eslint/no-import-type-side-effects': warn,

    'import/no-useless-path-segments': [
      warn,
      {
        noUselessIndex: true,
      },
    ],
  },
}

const nonFix: ConfigWithExtends = {
  ...base,
  rules: {
    'no-return-assign': warn,
    'no-func-assign': warn,
    'no-class-assign': warn,
    'import/no-mutable-exports': warn,
    'react-hooks/rules-of-hooks': warn,
    'react-hooks/exhaustive-deps': warn,

    '@typescript-eslint/no-unused-vars': [warn, { args: 'none' }],
    '@typescript-eslint/no-shadow': warn,

    'prefer-arrow/prefer-arrow-functions': [
      off,
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: true,
      },
    ],
    'prefer-arrow-callback': [warn, { allowNamedFunctions: true }],
    'func-style': [warn, 'expression', { allowArrowFunctions: true }],

    'import/no-default-export': off,
  },
}

const dirsWithAlias = [
  {
    rootDir: './src',
    prefix: '#',
  },
]
const noRelativeImport: ConfigWithExtends[] = dirsWithAlias.map(d => ({
  ...base,
  files: base.files?.map(f => `${d.rootDir}/${f}`),
  rules: {
    // import - no relative import
    'no-relative-import-paths/no-relative-import-paths': [
      warn,
      { allowSameFolder: false, ...d },
    ],
  },
}))

const extensionsAllowedDefaultExport = '{config,route}'
const allowedDefaultExport: ConfigWithExtends = {
  ...base,
  files: [`**/*.${extensionsAllowedDefaultExport}.*`],
  rules: {
    'import/no-default-export': off,
  },
}

export default tseslint.config(
  gitignore,
  base,
  noRelativeImport,
  nonFix,
  allowedDefaultExport,
)
