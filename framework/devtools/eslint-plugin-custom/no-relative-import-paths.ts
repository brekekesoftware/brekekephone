// copied from MelvinVermeer/eslint-plugin-no-relative-import-paths
// the original repo is no longer maintained, and the original code has some issues

import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import { path } from '@/nodejs/path'

interface NoRelativeImportPathsOptions {
  allowSameFolder?: boolean
  rootDir?: string
  prefix?: string
  allowedDepth?: number
}

export const noRelativeImportPaths: TSESLint.RuleModule<
  'relativeImportPath',
  [NoRelativeImportPathsOptions]
> = {
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: {
      description: 'Enforce absolute import paths instead of relative paths',
    },
    messages: {
      relativeImportPath: 'Import statements should have an absolute path',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowSameFolder: { type: 'boolean' },
          rootDir: { type: 'string' },
          prefix: { type: 'string' },
          allowedDepth: { type: 'number' },
        },
        additionalProperties: false,
      },
    ],
  },

  defaultOptions: [
    {
      allowSameFolder: false,
      rootDir: '',
      prefix: '',
    },
  ],

  create: c => {
    const options = c.options[0] || {}
    const allowedDepth = options.allowedDepth
    const allowSameFolder = options.allowSameFolder || false
    const rootDir = options.rootDir || ''
    const prefix = options.prefix || ''

    return {
      ImportDeclaration: (node: TSESTree.ImportDeclaration) => {
        const importPath = node.source.value

        if (isParentFolder(importPath, c, rootDir)) {
          if (
            typeof allowedDepth === 'undefined' ||
            getRelativePathDepth(importPath) > allowedDepth
          ) {
            c.report({
              node,
              messageId: 'relativeImportPath',
              fix: fixer =>
                fixer.replaceTextRange(
                  [node.source.range[0] + 1, node.source.range[1] - 1],
                  getAbsolutePath(importPath, c, rootDir, prefix),
                ),
            })
          }
        }

        if (isSameFolder(importPath) && !allowSameFolder) {
          c.report({
            node,
            messageId: 'relativeImportPath',
            fix: fixer =>
              fixer.replaceTextRange(
                [node.source.range[0] + 1, node.source.range[1] - 1],
                getAbsolutePath(importPath, c, rootDir, prefix),
              ),
          })
        }
      },
    }
  },
}

const isParentFolder = (
  relativeFilePath: string,
  context: TSESLint.RuleContext<
    'relativeImportPath',
    [NoRelativeImportPathsOptions]
  >,
  rootDir: string,
): boolean => {
  const absoluteRootPath = path.isAbsolute(rootDir)
    ? rootDir
    : path.join(context.cwd, rootDir)
  const absoluteFilePath = path.join(
    path.dirname(context.filename),
    relativeFilePath,
  )

  return (
    relativeFilePath.startsWith('../') &&
    (rootDir === '' ||
      (absoluteFilePath.startsWith(absoluteRootPath) &&
        context.filename.startsWith(absoluteRootPath)))
  )
}

const isSameFolder = (importPath: string): boolean =>
  importPath.startsWith('./') || importPath === '.'

const getRelativePathDepth = (importPath: string): number => {
  let depth = 0
  let remaining = importPath
  while (remaining.startsWith('../')) {
    depth += 1
    remaining = remaining.substring(3)
  }
  return depth
}

const getAbsolutePath = (
  relativePath: string,
  context: TSESLint.RuleContext<
    'relativeImportPath',
    [NoRelativeImportPathsOptions]
  >,
  rootDir: string,
  prefix: string,
): string => {
  const absoluteRootDir = path.isAbsolute(rootDir)
    ? rootDir
    : path.join(context.cwd, rootDir)
  const parts = path
    .relative(
      absoluteRootDir,
      path.join(path.dirname(context.filename), relativePath),
    )
    .split(path.sep)

  return [prefix, ...parts].filter(Boolean).join('/')
}
