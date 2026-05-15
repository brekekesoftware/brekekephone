import type { ESLint } from 'eslint'

import { enforceUseClient } from '@/devtools/eslint-plugin-custom/enforce-use-client'
import { errName } from '@/devtools/eslint-plugin-custom/err-name'
import { noAccessProperty } from '@/devtools/eslint-plugin-custom/no-access-property'
import { noImportDefault } from '@/devtools/eslint-plugin-custom/no-import-default'
import { noImportInvalidVariant } from '@/devtools/eslint-plugin-custom/no-import-invalid-variant'
import { noImportOutside } from '@/devtools/eslint-plugin-custom/no-import-outside'
import { noJsonStringify } from '@/devtools/eslint-plugin-custom/no-json-stringify'
import { noMissingExport } from '@/devtools/eslint-plugin-custom/no-missing-export'
import { noNullishCoalescing } from '@/devtools/eslint-plugin-custom/no-nullish-coalescing'
import { noRelativeExportPaths } from '@/devtools/eslint-plugin-custom/no-relative-export-paths'
import { noRelativeImportPaths } from '@/devtools/eslint-plugin-custom/no-relative-import-paths'
import { noUseState } from '@/devtools/eslint-plugin-custom/no-use-state'
import { noVoidUnion } from '@/devtools/eslint-plugin-custom/no-void-union'

export const customPlugin = {
  meta: {
    name: 'custom',
  },
  rules: {
    'enforce-use-client': enforceUseClient,
    'err-name': errName,
    'no-access-property': noAccessProperty,
    'no-import-default': noImportDefault,
    'no-import-invalid-variant': noImportInvalidVariant,
    'no-import-outside': noImportOutside,
    'no-json-stringify': noJsonStringify,
    'no-missing-export': noMissingExport,
    'no-nullish-coalescing': noNullishCoalescing,
    'no-relative-export-paths': noRelativeExportPaths,
    'no-relative-import-paths': noRelativeImportPaths,
    'no-use-state': noUseState,
    'no-void-union': noVoidUnion,
  },
} as unknown as ESLint.Plugin
