import type { ConfigWithExtends } from '@eslint/config-helpers'
import { defineConfig, includeIgnoreFile } from '@eslint/config-helpers'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import * as tsParser from '@typescript-eslint/parser'
import * as importPlugin from 'eslint-plugin-import'
import preferArrowPlugin from 'eslint-plugin-prefer-arrow'
import reactPlugin from 'eslint-plugin-react'
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort'
import unicornPlugin from 'eslint-plugin-unicorn'
import globals from 'globals'

import { enforceUseClient } from '@/devtools/eslint/config-enforce-use-client'
import { restrictedImports } from '@/devtools/eslint/config-restricted-imports'
import { customPlugin } from '@/devtools/eslint-plugin-custom'
import { fs } from '@/nodejs/fs'
import { gitignorePath } from '@/nodejs/gitignore'
import { globSync } from '@/nodejs/glob'
import { path } from '@/nodejs/path'
import { frameworkRoot } from '@/root'
import type { StrMap } from '@/shared/ts-utils'

const off = 0
const warn = 1
const gitignore = includeIgnoreFile(gitignorePath)

const tsExts = '{ts,tsx}'
const jsExts = '{js,jsx,cjs,mjs}'
const allExts = `{${[tsExts, jsExts].map(s => s.slice(1, -1)).join(',')}}`

type IgnoresOptions = {
  dirs: string
  exts?: string
}
const ignores = ({ dirs, exts = dirs }: IgnoresOptions) => [
  // dirs
  `**/${dirs}/**/*.${allExts}`,
  // sub exts
  `**/*.${exts}.${allExts}`,
]

type Alias = {
  rootDir: string
  prefix: string
}
type Options = {
  dir: string
  extraPlugins?: StrMap<string>
  overriddenRules?: StrMap
  alias?: Alias[] | boolean
  ignoreShadowed?: boolean
  ignoreFramework?: boolean
  tsProjectService?: boolean
}

export const config = ({
  dir,
  extraPlugins,
  overriddenRules,
  // use flags to esable those features since it can be slow
  alias = !!process.env._ESLINT_ALIAS,
  ignoreShadowed = !!process.env._ESLINT_IGNORE_SHADOWED,
  ignoreFramework = !!process.env._ESLINT_IGNORE_FRAMEWORK,
  tsProjectService = !!process.env._ESLINT_TS_PROJECT_SERVICE,
}: Options) => {
  const jsShadowed: string[] = []
  if (ignoreShadowed) {
    jsShadowed.push(
      ...globSync(`**/*.${jsExts}`, {
        cwd: dir,
        relative: true,
      }).filter(p =>
        tsExts
          .split(',')
          .some(e => fs.existsSync(p.replace(/\.\w+$/, `.${e}`))),
      ),
    )
  }
  const baseIgnores = [
    // match with prettier ignore and tsconfig exclude
    '**/*.min.*',
    ...jsShadowed,
  ]
  if (ignoreFramework) {
    baseIgnores.push(`${frameworkRoot}/**`)
  }

  const ignoresNonFixable = [
    ...baseIgnores,
    ...ignores({
      dirs: '{codegen,3rd-party}',
    }),
  ]
  const ignoreDefaultExport = [
    ...ignoresNonFixable,
    ...ignores({
      dirs: '{app,.storybook}',
      exts: '{config,stories}',
    }),
  ]

  const alreadyMergedRules: StrMap<boolean> = {}
  const mergeRules = (rules: StrMap) => {
    if (!overriddenRules) {
      return rules
    }
    for (const k in rules) {
      if (k in overriddenRules) {
        rules[k] = overriddenRules[k]
        alreadyMergedRules[k] = true
      }
    }
    return rules
  }

  const base: ConfigWithExtends = {
    files: [`**/*.${allExts}`],
    ignores: baseIgnores,
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      import: importPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      'prefer-arrow': preferArrowPlugin,
      unicorn: unicornPlugin,
      custom: customPlugin,
      ...extraPlugins,
    },
    rules: mergeRules({
      curly: [warn, 'all'],
      quotes: [warn, 'single', { avoidEscape: true }],
      'react/jsx-curly-brace-presence': warn,
      semi: [warn, 'never'],
      'arrow-body-style': [warn, 'as-needed'],
      'no-useless-rename': warn,
      'object-shorthand': [warn, 'always'],
      'one-var': [warn, 'never'],
      'prefer-const': warn,
      'spaced-comment': [warn, 'always', { markers: ['/'] }],
      'react/jsx-no-useless-fragment': warn,
      'react/self-closing-comp': warn,

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
      'import/enforce-node-protocol-usage': [warn, 'always'],
    }),
  }

  const nonFixable: ConfigWithExtends = {
    ...base,
    rules: mergeRules({
      eqeqeq: [warn, 'always'],
      'no-return-assign': warn,
      'no-func-assign': warn,
      'no-class-assign': warn,
      '@typescript-eslint/no-unused-vars': [warn, { args: 'none' }],
      '@typescript-eslint/no-shadow': warn,

      'no-restricted-imports': [warn, { paths: restrictedImports }],

      'import/no-mutable-exports': warn,
      'import/no-extraneous-dependencies': [
        warn,
        {
          ignore: ['tsconfig-paths', 'json5'],
          includeTypes: true,
        },
      ],
      'unicorn/filename-case': [warn, { case: 'kebabCase' }],

      'prefer-arrow/prefer-arrow-functions': [
        warn,
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: true,
        },
      ],
      'prefer-arrow-callback': [warn, { allowNamedFunctions: true }],
      'func-style': [warn, 'expression', { allowArrowFunctions: true }],

      'react/destructuring-assignment': [
        warn,
        'always',
        { destructureInSignature: 'always' },
      ],

      'custom/enforce-use-client': [warn, enforceUseClient],
      'custom/err-name': warn,
      'custom/no-missing-export': warn,
      'custom/no-access-property': off,
      'custom/no-import-default': [warn, ['react']],
      'custom/no-import-invalid-variant': warn,
      'custom/no-import-outside': off,
      'custom/no-json-stringify': warn,
      'custom/no-nullish-coalescing': warn,
      'custom/no-use-state': off,
      'custom/no-void-union': off,
    }),
  }

  const aliases: Alias[] = [
    {
      rootDir: path.relative(dir, frameworkRoot),
      prefix: '@',
    },
  ]
  if (Array.isArray(alias)) {
    aliases.push(...alias)
  } else if (alias) {
    aliases.push(
      ...globSync('**/src', {
        cwd: dir,
        onlyFiles: false,
        relative: true,
      }).map(srcDir => ({
        rootDir: srcDir,
        prefix: '#',
      })),
    )
  }

  const noRelativeImport: ConfigWithExtends[] = aliases.map(d => ({
    ...base,
    files: base.files?.map(f => `${d.rootDir}/${f}`),
    rules: mergeRules({
      'custom/no-relative-import-paths': [
        warn,
        { allowSameFolder: false, ...d },
      ],
    }),
  }))
  const noRelativeExport: ConfigWithExtends[] = aliases.map(d => ({
    ...base,
    files: base.files?.map(f => `${d.rootDir}/${f}`),
    rules: mergeRules({
      'custom/no-relative-export-paths': [warn, d],
    }),
  }))

  const noDefaultExport: ConfigWithExtends = {
    ...base,
    ignores: ignoreDefaultExport,
    rules: mergeRules({
      // TODO: not compatible eslint 10
      'import/no-default-export': off,
    }),
  }

  let tsBase: ConfigWithExtends[] = []
  let tsNonFixable: ConfigWithExtends[] = []

  if (tsProjectService) {
    const tsconfig = globSync('**/tsconfig.json')
    tsBase = tsconfig.map(p => ({
      ...base,
      languageOptions: {
        ...base.languageOptions,
        parserOptions: {
          projectService: true,
          tsconfigRootDir: p,
        },
      },
      rules: mergeRules({
        // no rule yet
      }),
    }))
    tsNonFixable = tsBase.map(b => ({
      ...b,
      ignores: ignoresNonFixable,
      rules: mergeRules({
        '@typescript-eslint/no-unnecessary-condition': warn,
      }),
    }))
  }

  if (overriddenRules) {
    const unusedKeys = Object.keys(overriddenRules).filter(
      k => !alreadyMergedRules[k],
    )
    if (unusedKeys.length) {
      nonFixable.rules = {
        ...nonFixable.rules,
        ...unusedKeys.reduce<StrMap>((m, k) => {
          m[k] = overriddenRules[k]
          return m
        }, {}),
      }
    }
  }

  return defineConfig(
    gitignore,
    base,
    nonFixable,
    noRelativeImport,
    noRelativeExport,
    noDefaultExport,
    tsBase,
    tsNonFixable,
  )
}
