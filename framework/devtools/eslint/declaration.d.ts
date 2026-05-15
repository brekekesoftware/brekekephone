declare module '@typescript-eslint/parser' {
  import type { TSESLint } from '@typescript-eslint/utils'

  const m: TSESLint.Parser.LooseParserModule
  export = m
}

declare module '@typescript-eslint/eslint-plugin' {
  import type { ESLint } from 'eslint'

  const m: ESLint.Plugin
  export = m
}

declare module 'eslint-plugin-import' {
  import type { ESLint } from 'eslint'

  const m: ESLint.Plugin
  export = m
}

declare module 'eslint-plugin-prefer-arrow' {
  import type { ESLint } from 'eslint'

  const m: ESLint.Plugin
  export = m
}

declare module 'eslint-plugin-react' {
  import type { ESLint } from 'eslint'

  const m: ESLint.Plugin
  export = m
}
