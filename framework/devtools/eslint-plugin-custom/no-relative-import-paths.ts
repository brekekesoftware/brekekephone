// copied from MelvinVermeer/eslint-plugin-no-relative-import-paths
// the original repo is no longer maintained, and the original code has some issues

import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import { path } from '@/nodejs/path'

interface NoRelativeImportPathsOptions {
  absPath: string
  alias: string
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
          absPath: {
            type: 'string',
            required: true,
          },
          alias: {
            type: 'string',
            required: true,
          },
        },
        additionalProperties: false,
        required: true,
      },
    ],
  },

  create: c => {
    const { absPath, alias } = c.options[0]

    return {
      ImportDeclaration: (node: TSESTree.ImportDeclaration) => {
        const importPath = node.source.value
        const [start, end] = node.source.range

        if (isParentFolder(importPath, c, absPath)) {
          c.report({
            node,
            messageId: 'relativeImportPath',
            fix: f =>
              f.replaceTextRange(
                [start + 1, end - 1],
                getAbsolutePath(importPath, c, absPath, alias),
              ),
          })
        }

        if (isSameFolder(importPath)) {
          c.report({
            node,
            messageId: 'relativeImportPath',
            fix: f =>
              f.replaceTextRange(
                [start + 1, end - 1],
                getAbsolutePath(importPath, c, absPath, alias),
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
  absPath: string,
): boolean => {
  const absoluteFilePath = path.join(
    path.dirname(context.filename),
    relativeFilePath,
  )

  return (
    relativeFilePath.startsWith('../') &&
    (absPath === '' ||
      (absoluteFilePath.startsWith(absPath) &&
        context.filename.startsWith(absPath)))
  )
}

const isSameFolder = (importPath: string): boolean =>
  importPath.startsWith('./') || importPath === '.'

const getAbsolutePath = (
  relativePath: string,
  context: TSESLint.RuleContext<
    'relativeImportPath',
    [NoRelativeImportPathsOptions]
  >,
  absPath: string,
  alias: string,
): string => {
  const parts = path
    .relative(absPath, path.join(path.dirname(context.filename), relativePath))
    .split(path.sep)

  return [alias, ...parts].filter(Boolean).join('/')
}
