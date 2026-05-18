import * as tsParser from '@typescript-eslint/parser'
import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import { fs } from '@/nodejs/fs'
import { path } from '@/nodejs/path'
import { upperFirst } from '@/shared/lodash'

const variants = ['native', 'ios', 'android', 'client'] as const
type Variant = (typeof variants)[number]
const exts = ['ts', 'tsx'] as const

export const noMissingExport: TSESLint.RuleModule<
  'exportMissing' | 'exportExtra',
  []
> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate exports match across extension variants',
    },
    messages: {
      exportMissing:
        "Export '{{name}}' is present in '{{other}}' but missing from this file",
      exportExtra:
        "Export '{{name}}' is not present in '{{other}}' but exists in this file",
    },
    schema: [],
  },

  defaultOptions: [],

  create: c => {
    if (isVariantFile(c.filename)) {
      return {}
    }

    const base = getBaseWithoutExt(c.filename)
    if (!base) {
      return {}
    }

    return {
      'Program:exit': (program: TSESTree.Program) => {
        const currentExports = collectExports(program)
        if (!currentExports) {
          return
        }

        const variantPaths = getVariantPaths(base)
        const validThisSuffix = variantPaths.some(v => v.variant === 'client')
          ? 'Server'
          : 'Web'

        for (const v of variantPaths) {
          const otherExports = getFileExports(v.path)
          if (!otherExports) {
            continue
          }

          const otherName = path.basename(v.path)

          const validOtherSuffix = upperFirst(v.variant)
          for (const name of otherExports) {
            if (currentExports.has(name) || name.endsWith(validOtherSuffix)) {
              continue
            }
            c.report({
              node: program,
              messageId: 'exportMissing',
              data: { name, other: otherName },
            })
          }

          for (const name of currentExports) {
            if (otherExports.has(name) || name.endsWith(validThisSuffix)) {
              continue
            }
            c.report({
              node: program,
              messageId: 'exportExtra',
              data: { name, other: otherName },
            })
          }
        }
      },
    }
  },
}

const isVariantFile = (filename: string): boolean => {
  for (const v of variants) {
    for (const e of exts) {
      if (filename.endsWith(`.${v}.${e}`)) {
        return true
      }
    }
  }
  return false
}

const getBaseWithoutExt = (filename: string): string | null => {
  for (const e of exts) {
    const de = `.${e}`
    if (filename.endsWith(de)) {
      return filename.slice(0, -de.length)
    }
  }
  return null
}

type VariantPath = {
  variant: Variant
  path: string
}

const getVariantPaths = (base: string) => {
  const r: VariantPath[] = []
  for (const v of variants) {
    for (const e of exts) {
      const filepath = `${base}.${v}.${e}`
      if (fs.existsSync(filepath)) {
        r.push({ variant: v, path: filepath })
      }
    }
  }
  return r
}

const collectExports = (program: TSESTree.Program) => {
  const set = new Set<string>()
  for (const node of program.body) {
    if (node.type === 'ExportAllDeclaration') {
      // export * from '...' - cannot statically know names, skip comparison
      return null
    }
    if (node.type === 'ExportDefaultDeclaration') {
      set.add('default')
      continue
    }
    if (node.type !== 'ExportNamedDeclaration') {
      continue
    }
    if (node.exportKind === 'type') {
      continue
    }
    for (const spec of node.specifiers) {
      if (spec.exportKind === 'type') {
        continue
      }
      const exported = spec.exported
      set.add(exported.type === 'Identifier' ? exported.name : exported.value)
    }
    const decl = node.declaration
    if (!decl) {
      continue
    }
    if (decl.type === 'VariableDeclaration') {
      for (const d of decl.declarations) {
        if (d.id.type === 'Identifier') {
          set.add(d.id.name)
        }
      }
    } else if (
      decl.type === 'FunctionDeclaration' ||
      decl.type === 'ClassDeclaration' ||
      decl.type === 'TSEnumDeclaration'
    ) {
      if (decl.id) {
        set.add(decl.id.name)
      }
    }
  }
  return set
}

const getFileExports = (filepath: string) => {
  const content = fs.readFileSync(filepath, 'utf-8')
  // @ts-ignore - parse is not typed properly, but it actually exists
  const ast: TSESTree.Program = tsParser.parse(content, {
    jsx: filepath.endsWith('.tsx'),
  })
  return collectExports(ast)
}
